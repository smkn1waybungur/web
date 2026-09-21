const state = {
  siswa: [],
  kelas: [],
  settings: {}
};

const el = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  bindNavigation();
  bindUI();
  boot();
});

function bindNavigation() {
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      document.querySelectorAll(".nav-link").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".page").forEach(x => x.classList.remove("active"));
      el(`page-${page}`).classList.add("active");
      el("pageTitle").textContent = btn.querySelector("span").textContent;
      el("sidebar").classList.remove("open");
    });
  });
}

function bindUI() {
  el("menuBtn").addEventListener("click", () => el("sidebar").classList.toggle("open"));
  el("refreshBtn").addEventListener("click", boot);
  el("addStudentBtn").addEventListener("click", () => openStudentModal());
  el("closeModalBtn").addEventListener("click", closeStudentModal);
  el("cancelModalBtn").addEventListener("click", closeStudentModal);
  el("studentModal").addEventListener("click", e => {
    if (e.target === el("studentModal")) closeStudentModal();
  });
  el("searchInput").addEventListener("input", renderStudents);
  el("classFilter").addEventListener("change", renderStudents);
  el("studentForm").addEventListener("submit", saveStudent);
}

async function boot() {
  setConnection("⏳ Menghubungkan...", "");
  try {
    const [settingsRes, classRes, studentRes] = await Promise.all([
      GuruWebAPI.settings(),
      GuruWebAPI.kelas(),
      GuruWebAPI.siswa()
    ]);

    state.settings = settingsRes.data || {};
    state.kelas = classRes.data || [];
    state.siswa = studentRes.data || [];

    renderSettings();
    renderClasses();
    fillClassSelectors();
    renderStudents();
    renderDashboard();

    setConnection("✓ Terhubung ke Google Sheets", "ok");
  } catch (error) {
    console.error(error);
    setConnection("✕ Gagal terhubung", "bad");
    toast(error.message, true);
  }
}

function renderSettings() {
  const s = state.settings;
  el("brandAppName").textContent = s.app_name || "GuruWeb Gratis";
  el("schoolLine").textContent = `${s.school_name || "Nama Sekolah"} • ${s.teacher_name || "Nama Guru"}`;
  el("settingAppName").textContent = s.app_name || "-";
  el("settingSchool").textContent = s.school_name || "-";
  el("settingTeacher").textContent = s.teacher_name || "-";
  el("settingVersion").textContent = s.version || "-";
  document.title = s.app_name || "GuruWeb Gratis";
}

function renderDashboard() {
  el("statSiswa").textContent = state.siswa.length;
  el("statKelas").textContent = state.kelas.length || new Set(state.siswa.map(x => x.kelas).filter(Boolean)).size;
  el("statAktif").textContent = state.siswa.filter(x => String(x.status).toLowerCase() === "aktif").length;

  const recent = state.siswa.slice(-5).reverse();
  el("recentStudents").innerHTML = recent.length
    ? `<div class="recent-list">${recent.map((s, i) => `
        <div class="recent-item">
          <div class="recent-no">${i + 1}</div>
          <div>
            <strong>${escapeHtml(s.nama)}</strong>
            <small>${escapeHtml(s.nis)} • ${escapeHtml(s.kelas)}</small>
          </div>
          ${statusBadge(s.status)}
        </div>`).join("")}</div>`
    : `<div class="empty">Belum ada data siswa.</div>`;
}

function renderStudents() {
  const keyword = el("searchInput").value.trim().toLowerCase();
  const className = el("classFilter").value;

  const filtered = state.siswa.filter(s => {
    const text = `${s.nis} ${s.nama} ${s.kelas}`.toLowerCase();
    return (!keyword || text.includes(keyword)) && (!className || s.kelas === className);
  });

  el("studentTableBody").innerHTML = filtered.length
    ? filtered.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(s.nis)}</td>
        <td><b>${escapeHtml(s.nama)}</b></td>
        <td>${escapeHtml(s.jk)}</td>
        <td>${escapeHtml(s.kelas)}</td>
        <td>${statusBadge(s.status)}</td>
        <td>
          <div class="actions">
            <button class="mini-btn edit-btn" onclick="editStudent('${jsSafe(s.id)}')">Edit</button>
            <button class="mini-btn delete-btn" onclick="deleteStudent('${jsSafe(s.id)}','${jsSafe(s.nama)}')">Hapus</button>
          </div>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="7"><div class="empty">Data tidak ditemukan.</div></td></tr>`;
}

function renderClasses() {
  el("classTableBody").innerHTML = state.kelas.length
    ? state.kelas.map((k, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(k.id)}</td>
        <td><b>${escapeHtml(k.nama_kelas)}</b></td>
        <td>${escapeHtml(k.wali_kelas)}</td>
        <td>${statusBadge(k.status)}</td>
      </tr>`).join("")
    : `<tr><td colspan="5"><div class="empty">Belum ada data kelas.</div></td></tr>`;
}

function fillClassSelectors() {
  const names = [...new Set([
    ...state.kelas.map(k => k.nama_kelas),
    ...state.siswa.map(s => s.kelas)
  ].filter(Boolean))].sort();

  el("classFilter").innerHTML = `<option value="">Semua kelas</option>` +
    names.map(x => `<option value="${htmlAttr(x)}">${escapeHtml(x)}</option>`).join("");

  el("studentClass").innerHTML = `<option value="">Pilih kelas</option>` +
    names.map(x => `<option value="${htmlAttr(x)}">${escapeHtml(x)}</option>`).join("");
}

function openStudentModal(student = null) {
  el("modalTitle").textContent = student ? "Edit Siswa" : "Tambah Siswa";
  el("studentId").value = student?.id || "";
  el("studentNis").value = student?.nis || "";
  el("studentName").value = student?.nama || "";
  el("studentGender").value = student?.jk || "";
  el("studentClass").value = student?.kelas || "";
  el("studentStatus").value = student?.status || "Aktif";
  el("studentModal").classList.add("open");
  setTimeout(() => el("studentNis").focus(), 50);
}

function closeStudentModal() {
  el("studentModal").classList.remove("open");
  el("studentForm").reset();
  el("studentId").value = "";
}

function editStudent(id) {
  const student = state.siswa.find(s => String(s.id) === String(id));
  if (!student) return toast("Data siswa tidak ditemukan.", true);
  openStudentModal(student);
}

async function saveStudent(event) {
  event.preventDefault();

  const id = el("studentId").value;
  const payload = {
    id,
    nis: el("studentNis").value.trim(),
    nama: el("studentName").value.trim(),
    jk: el("studentGender").value,
    kelas: el("studentClass").value,
    status: el("studentStatus").value
  };

  if (!payload.nis || !payload.nama || !payload.jk || !payload.kelas) {
    return toast("Lengkapi data siswa.", true);
  }

  el("saveStudentBtn").disabled = true;
  el("saveStudentBtn").textContent = "Menyimpan...";

  try {
    if (id) {
      await GuruWebAPI.updateSiswa(payload);
      toast("Data siswa berhasil diperbarui.");
    } else {
      await GuruWebAPI.tambahSiswa(payload);
      toast("Siswa berhasil ditambahkan.");
    }
    closeStudentModal();
    await boot();
  } catch (error) {
    console.error(error);
    toast(error.message, true);
  } finally {
    el("saveStudentBtn").disabled = false;
    el("saveStudentBtn").textContent = "Simpan";
  }
}

async function deleteStudent(id, name) {
  if (!confirm(`Hapus data ${name}?`)) return;
  try {
    await GuruWebAPI.hapusSiswa(id);
    toast("Data siswa berhasil dihapus.");
    await boot();
  } catch (error) {
    console.error(error);
    toast(error.message, true);
  }
}

function statusBadge(status) {
  const active = String(status).toLowerCase() === "aktif";
  return `<span class="badge ${active ? "" : "off"}">${escapeHtml(status || "-")}</span>`;
}

function setConnection(text, type) {
  el("connectionBadge").textContent = text;
  el("connectionBadge").className = `connection ${type || ""}`;
}

let toastTimer;
function toast(message, isError = false) {
  clearTimeout(toastTimer);
  el("toast").textContent = message;
  el("toast").className = `toast show ${isError ? "error" : ""}`;
  toastTimer = setTimeout(() => el("toast").className = "toast", 3200);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function htmlAttr(value) {
  return escapeHtml(value);
}

function jsSafe(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}
