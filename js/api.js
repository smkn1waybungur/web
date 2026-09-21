const GuruWebAPI = (() => {
  const apiUrl = () => (window.GURUWEB_CONFIG?.API_URL || "").trim();

  function ensureConfigured() {
    const url = apiUrl();
    if (!url || url.includes("PASTE_URL")) {
      throw new Error("API_URL belum diisi pada js/config.js");
    }
    return url;
  }

  async function get(action) {
    const url = ensureConfigured();
    const response = await fetch(`${url}?action=${encodeURIComponent(action)}`, {
      method: "GET",
      redirect: "follow",
      cache: "no-store"
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Permintaan gagal");
    return data;
  }

  async function post(payload) {
    const url = ensureConfigured();
    const body = new URLSearchParams();
    Object.entries(payload).forEach(([key, value]) => body.append(key, value ?? ""));

    const response = await fetch(url, {
      method: "POST",
      body,
      redirect: "follow"
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Permintaan gagal");
    return data;
  }

  return {
    status: () => get("status"),
    settings: () => get("settings"),
    siswa: () => get("siswa"),
    kelas: () => get("kelas"),
    tambahSiswa: (data) => post({ action: "tambah_siswa", ...data }),
    updateSiswa: (data) => post({ action: "update_siswa", ...data }),
    hapusSiswa: (id) => post({ action: "hapus_siswa", id })
  };
})();
