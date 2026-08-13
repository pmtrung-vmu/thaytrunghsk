/* HSK Ôn Từ — đăng nhập, tài khoản & theo dõi tiến độ học viên.
   Dùng Firebase Authentication (email/mật khẩu) + Cloud Firestore.
   Tự viết toàn bộ; chỉ gọi SDK chính thức của Firebase (Google).

   File này tạo ra `window.HSKAuth`, một API nhỏ để app.js gọi vào,
   để phần định tuyến/hiển thị (app.js) không cần biết chi tiết Firebase. */

(function () {
  const isPlaceholder = !firebaseConfig || String(firebaseConfig.apiKey || "").startsWith("DÁN_");

  const listeners = [];
  const state = { user: null, profile: null, ready: false };

  let auth = null;
  let db = null;

  if (!isPlaceholder) {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
  }

  function notify() {
    renderAuthSlot();
    listeners.forEach((cb) => { try { cb(state); } catch (e) { console.error(e); } });
  }

  async function loadOrCreateProfile(user) {
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();
    if (snap.exists) return snap.data();
    // Không tự tạo hồ sơ ở đây nữa — tài khoản học viên luôn được giáo viên
    // tạo sẵn hồ sơ (users/{uid}) cùng lúc với tài khoản đăng nhập. Nếu thiếu
    // hồ sơ nghĩa là tài khoản chưa được cấp đầy đủ (hoặc là tài khoản giáo
    // viên đầu tiên chưa được thêm hồ sơ thủ công — xem FIREBASE_SETUP.md).
    return null;
  }

  let readyResolve;
  const readyPromise = new Promise((res) => { readyResolve = res; });

  if (auth) {
    auth.onAuthStateChanged(async (user) => {
      state.user = user;
      state.profile = user ? await loadOrCreateProfile(user) : null;
      state.ready = true;
      readyResolve();
      notify();
    });
  } else {
    state.ready = true;
    readyResolve();
  }

  function todayKey() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function requireConfigured() {
    if (isPlaceholder) {
      const err = new Error("Chưa cấu hình Firebase — xem file FIREBASE_SETUP.md để bật đăng nhập.");
      err.code = "not-configured";
      throw err;
    }
  }

  const FRIENDLY_ERR = {
    "auth/email-already-in-use": "Email này đã có tài khoản rồi.",
    "auth/invalid-email": "Email không hợp lệ.",
    "auth/weak-password": "Mật khẩu quá ngắn (cần ít nhất 6 ký tự).",
    "auth/user-not-found": "Không tìm thấy tài khoản với email này.",
    "auth/wrong-password": "Sai mật khẩu.",
    "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
    "auth/too-many-requests": "Bạn thử sai quá nhiều lần, hãy đợi một lát rồi thử lại.",
  };
  function friendlyError(err) {
    if (err && err.code === "not-configured") return err.message;
    return (err && FRIENDLY_ERR[err.code]) || (err && err.message) || "Có lỗi xảy ra.";
  }

  /* ---- App Firebase phụ, chỉ để tạo tài khoản Auth cho học viên mà không
     làm mất phiên đăng nhập hiện tại của giáo viên (kỹ thuật chuẩn của
     Firebase khi cần "admin tạo tài khoản người khác" ở phía trình duyệt,
     không cần máy chủ/Cloud Functions riêng). ---- */
  function getSecondaryAuth() {
    let secApp = firebase.apps.find((a) => a.name === "Secondary");
    if (!secApp) secApp = firebase.initializeApp(firebaseConfig, "Secondary");
    return secApp.auth();
  }

  function defaultStats() {
    return {
      quizAttempts: 0, quizCorrectTotal: 0, quizQuestionsTotal: 0,
      fillAttempts: 0, fillCorrectTotal: 0, fillQuestionsTotal: 0,
      viewedUnitKeys: [], unitLabels: {}, scores: {}, wrongWords: {}, studyDays: {},
    };
  }

  function requireTeacher() {
    if (!state.profile || state.profile.role !== "teacher") {
      throw new Error("Chỉ tài khoản giáo viên mới thực hiện được thao tác này.");
    }
  }

  /* Giáo viên tạo một lớp học (tên + trình độ HSK). */
  async function createClass(name, level) {
    requireConfigured();
    requireTeacher();
    const ref = await db.collection("classes").add({
      name, level, teacherUid: state.user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  async function fetchClasses() {
    requireConfigured();
    requireTeacher();
    const snap = await db.collection("classes").get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  /* Giáo viên tạo tài khoản đăng nhập cho một học viên, gán sẵn vào một lớp
     (và do đó gán sẵn trình độ HSK học viên đó được phép ôn tập). Không có
     đường nào để học viên tự đăng ký tài khoản trong ứng dụng này nữa. */
  async function createStudentAccount({ name, email, password, classId, level, className }) {
    requireConfigured();
    requireTeacher();
    const secAuth = getSecondaryAuth();
    const cred = await secAuth.createUserWithEmailAndPassword(email, password);
    try {
      await cred.user.updateProfile({ displayName: name });
      // Ghi hồ sơ Firestore bằng phiên của GIÁO VIÊN (db mặc định) — không
      // phải phiên tạm vừa tạo — để khớp với luật bảo mật "chỉ giáo viên
      // mới được tạo document users/* cho người khác".
      await db.collection("users").doc(cred.user.uid).set({
        name, email, role: "student", classId, level, className,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastActiveTs: firebase.firestore.FieldValue.serverTimestamp(),
        stats: defaultStats(),
      });
    } finally {
      await secAuth.signOut().catch(() => {});
    }
    return { uid: cred.user.uid, email, password };
  }

  /* Giáo viên chuyển một học viên sang lớp khác (đổi cả trình độ được phép ôn). */
  async function updateStudentClass(uid, classId, level, className) {
    requireConfigured();
    requireTeacher();
    await db.collection("users").doc(uid).update({
      classId, level, className,
      lastActiveTs: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  /* Giáo viên sửa hồ sơ học viên — hiện chỉ cho sửa tên hiển thị (đổi lớp
     vẫn dùng updateStudentClass ở trên). Không cho sửa vai trò ở đây. */
  async function updateStudent(uid, { name }) {
    requireConfigured();
    requireTeacher();
    const payload = { lastActiveTs: firebase.firestore.FieldValue.serverTimestamp() };
    if (name !== undefined) payload.name = name;
    await db.collection("users").doc(uid).update(payload);
  }

  /* Giáo viên xóa hồ sơ học viên khỏi hệ thống. Vì đây là trang tĩnh không có
     máy chủ riêng (Cloud Functions/Admin SDK), Firebase KHÔNG cho phép một
     tài khoản (giáo viên) xóa tài khoản ĐĂNG NHẬP (Firebase Authentication)
     của người khác từ trình duyệt — chỉ chủ tài khoản mới tự xóa được tài
     khoản đăng nhập của chính mình. Hàm này xóa hồ sơ Firestore
     (users/{uid}), có tác dụng thu hồi quyền xem nội dung ngay lập tức (mọi
     trang đều yêu cầu hồ sơ hợp lệ mới cho xem). Nếu muốn xóa hẳn cả tài
     khoản đăng nhập gốc, giáo viên cần vào Firebase Console →
     Authentication → xóa thủ công (xem FIREBASE_SETUP.md). */
  async function deleteStudent(uid) {
    requireConfigured();
    requireTeacher();
    await db.collection("users").doc(uid).delete();
  }

  /* Giáo viên đổi tên/trình độ một lớp — đồng thời cập nhật lại className/
     level cho MỌI học viên đang thuộc lớp đó, để dữ liệu không bị lệch
     (nếu không, học viên cũ vẫn giữ trình độ lớp trước khi đổi). */
  async function updateClass(classId, { name, level }) {
    requireConfigured();
    requireTeacher();
    await db.collection("classes").doc(classId).update({ name, level });
    const snap = await db.collection("users").where("classId", "==", classId).get();
    if (!snap.empty) {
      const batch = db.batch();
      snap.docs.forEach((d) => batch.update(d.ref, { className: name, level }));
      await batch.commit();
    }
  }

  /* Giáo viên xóa một lớp — chỉ cho phép khi lớp không còn học viên nào,
     để tránh học viên bị "mồ côi" lớp mà giáo viên không để ý. */
  async function deleteClass(classId) {
    requireConfigured();
    requireTeacher();
    const snap = await db.collection("users").where("classId", "==", classId).get();
    if (!snap.empty) {
      const err = new Error(`Lớp này còn ${snap.size} học viên — hãy chuyển hết học viên sang lớp khác trước khi xóa lớp.`);
      err.code = "class-not-empty";
      throw err;
    }
    await db.collection("classes").doc(classId).delete();
  }

  async function logIn(email, password) {
    requireConfigured();
    const cred = await auth.signInWithEmailAndPassword(email, password);
    return cred.user;
  }

  async function logOut() {
    requireConfigured();
    stopHeartbeat();
    await auth.signOut();
  }

  async function resetPassword(email) {
    requireConfigured();
    await auth.sendPasswordResetEmail(email);
  }

  function userRef() {
    if (!state.user) return null;
    return db.collection("users").doc(state.user.uid);
  }

  function unitKeyOf(level, unitKey) {
    return `${level}_${unitKey}`;
  }

  function recordUnitViewed(level, unitKey, unitLabel) {
    const ref = userRef();
    if (!ref) return;
    const key = unitKeyOf(level, unitKey);
    ref.update({
      "stats.viewedUnitKeys": firebase.firestore.FieldValue.arrayUnion(key),
      [`stats.unitLabels.${key}`]: unitLabel,
      lastActiveTs: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch((e) => console.warn("recordUnitViewed:", e.message));
  }

  function recordAttempt({ level, unitKey, unitLabel, mode, score, total }) {
    const ref = userRef();
    if (!ref) return;
    const key = unitKeyOf(level, unitKey);
    const prefix = mode === "fill" ? "fill" : "quiz";
    ref.update({
      [`stats.${prefix}Attempts`]: firebase.firestore.FieldValue.increment(1),
      [`stats.${prefix}CorrectTotal`]: firebase.firestore.FieldValue.increment(score),
      [`stats.${prefix}QuestionsTotal`]: firebase.firestore.FieldValue.increment(total),
      [`stats.scores.${mode}_${key}`]: { score, total, unitLabel, ts: firebase.firestore.FieldValue.serverTimestamp() },
      "stats.viewedUnitKeys": firebase.firestore.FieldValue.arrayUnion(key),
      [`stats.unitLabels.${key}`]: unitLabel,
      lastActiveTs: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch((e) => console.warn("recordAttempt:", e.message));
  }

  function recordWrongWord(hanzi) {
    const ref = userRef();
    if (!ref || !hanzi) return;
    ref.update({
      [`stats.wrongWords.${hanzi}`]: firebase.firestore.FieldValue.increment(1),
      lastActiveTs: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch((e) => console.warn("recordWrongWord:", e.message));
  }

  let heartbeatTimer = null;
  function startHeartbeat() {
    stopHeartbeat();
    const ref = userRef();
    if (!ref) return;
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      ref.update({
        [`stats.studyDays.${todayKey()}`]: firebase.firestore.FieldValue.increment(0.5),
        lastActiveTs: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch((e) => console.warn("heartbeat:", e.message));
    };
    heartbeatTimer = setInterval(tick, 30000);
  }
  function stopHeartbeat() {
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  }

  async function fetchAllStudents() {
    requireConfigured();
    requireTeacher();
    const snap = await db.collection("users").where("role", "==", "student").get();
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  }

  function onChange(cb) {
    listeners.push(cb);
    return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); };
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  /* ---- Thanh trạng thái đăng nhập trên header ---- */
  function renderAuthSlot() {
    const slot = document.getElementById("auth-slot");
    if (!slot) return;
    if (isPlaceholder) {
      slot.innerHTML = `<a href="#/login" class="auth-note">Đăng nhập (chưa cấu hình)</a>`;
      return;
    }
    if (!state.user) {
      slot.innerHTML = `<a href="#/login">Đăng nhập</a>`;
      return;
    }
    const name = escapeHtml((state.profile && state.profile.name) || state.user.email);
    const isTeacher = state.profile && state.profile.role === "teacher";
    slot.innerHTML = `
      <span class="auth-hello">Xin chào, <b>${name}</b></span>
      ${isTeacher ? `<a href="#/teacher">📊 Trang giáo viên</a>` : ""}
      <a href="#" id="auth-logout-btn">Đăng xuất</a>
    `;
    const btn = document.getElementById("auth-logout-btn");
    if (btn) btn.addEventListener("click", (e) => { e.preventDefault(); logOut(); location.hash = "#/"; });
  }

  window.HSKAuth = {
    isConfigured: !isPlaceholder,
    ready: readyPromise,
    get user() { return state.user; },
    get profile() { return state.profile; },
    friendlyError,
    logIn, logOut, resetPassword,
    onChange,
    recordUnitViewed, recordAttempt, recordWrongWord,
    startHeartbeat, stopHeartbeat,
    fetchAllStudents,
    createClass, fetchClasses, createStudentAccount, updateStudentClass,
    updateStudent, deleteStudent, updateClass, deleteClass,
  };

  document.addEventListener("DOMContentLoaded", renderAuthSlot);
})();
