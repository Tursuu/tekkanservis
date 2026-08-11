const App = {
    currentView: "form",
    confirmCallback: null,
    currentUser: null,

    async init() {
        Form.init();
        List.init();
        this.bindNavigation();
        this.bindSettings();
        await this.initAuth();
        if (!this.currentUser) {
            this.navigate("auth");
        } else {
            this.navigate("form");
        }
        List.render();
    },

    bindNavigation() {
        document.querySelectorAll("[data-nav]").forEach(el => {
            el.addEventListener("click", () => {
                const view = el.dataset.nav;
                if (!this.currentUser && view !== "auth") {
                    this.toast("Önce giriş yapın", "error");
                    return;
                }
                if (view === "form" && this.currentView !== "form") {
                    Form.resetForm();
                }
                this.navigate(view);
            });
        });
    },

    navigate(view) {
        this.currentView = view;

        document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
        document.getElementById("view-" + view)?.classList.add("active");

        document.querySelectorAll(".nav-item").forEach(n => {
            n.classList.toggle("active", n.dataset.nav === view);
        });

        document.body.classList.toggle("auth-active", view === "auth");

        if (view === "list") List.render();
    },

    bindSettings() {
        document.getElementById("exportJsonBtn").addEventListener("click", () => {
            const json = Storage.exportJson();
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "tekkan-servis-yedek_" + new Date().toISOString().slice(0, 10) + ".json";
            a.click();
            URL.revokeObjectURL(url);
            this.toast("Yedek indirildi");
        });

        document.getElementById("importJsonBtn").addEventListener("click", () => {
            document.getElementById("importFile").click();
        });

        document.getElementById("importFile").addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const count = Storage.importJson(reader.result);
                    List.render();
                    this.toast(`${count} kayıt içe aktarıldı`, "success");
                } catch {
                    this.toast("Geçersiz dosya formatı", "error");
                }
            };
            reader.readAsText(file);
            e.target.value = "";
        });

        document.getElementById("clearAllBtn").addEventListener("click", () => {
            this.confirm(
                "Tüm Kayıtları Sil",
                "Bu işlem geri alınamaz. Tüm servis raporları silinecek.",
                () => {
                    Storage.clear();
                    List.render();
                    Form.resetForm();
                    this.toast("Tüm kayıtlar silindi");
                }
            );
        });

        document.getElementById("supabaseUploadBtn").addEventListener("click", async () => {
            try {
                const count = await Storage.syncToSupabase();
                this.toast(`${count} kayıt Supabase'e gönderildi`, "success");
            } catch (error) {
                console.error(error);
                const message = error?.message || error?.details || JSON.stringify(error);
                this.toast(`Supabase gönderimi hatası: ${message}`, "error");
            }
        });

        document.getElementById("supabaseDownloadBtn").addEventListener("click", async () => {
            try {
                const count = await Storage.syncFromSupabase();
                List.render();
                this.toast(`${count} kayıt Supabase'den indirildi`, "success");
            } catch (error) {
                console.error(error);
                const message = error?.message || error?.details || JSON.stringify(error);
                this.toast(`Supabase alma hatası: ${message}`, "error");
            }
        });

        document.getElementById("authSignUpBtn").addEventListener("click", () => this.signUp());
        document.getElementById("authSignInBtn").addEventListener("click", () => this.signIn());
        document.getElementById("signOutBtn").addEventListener("click", () => this.signOut());

        document.getElementById("confirmCancel").addEventListener("click", () => this.hideConfirm());
        document.getElementById("confirmOk").addEventListener("click", () => {
            if (this.confirmCallback) this.confirmCallback();
            this.hideConfirm();
        });
        document.querySelector(".modal-backdrop").addEventListener("click", () => this.hideConfirm());
    },

    async initAuth() {
        try {
            const client = getSupabaseClient();
            const { data } = await client.auth.getSession();
            this.currentUser = data.session?.user || null;
            this.updateAuthStatus();
            if (this.currentUser) {
                document.getElementById("technician").value = this.currentUser.email || "";
            }
        } catch (error) {
            console.error(error);
            this.currentUser = null;
        }
    },

    async signUp() {
        const email = document.getElementById("authEmail").value.trim();
        const password = document.getElementById("authPassword").value.trim();
        if (!email || !password) {
            this.toast("E-posta ve parola girin", "error");
            return;
        }

        try {
            const client = getSupabaseClient();
            const { error } = await client.auth.signUp({ email, password });
            if (error) throw error;
            this.toast("Hesap açma isteği gönderildi. E-postanı kontrol et", "success");
        } catch (error) {
            console.error(error);
            this.toast(error.message || "Hesap açılırken hata oluştu", "error");
        }
    },

    async signIn() {
        const email = document.getElementById("authEmail").value.trim();
        const password = document.getElementById("authPassword").value.trim();
        if (!email || !password) {
            this.toast("E-posta ve parola girin", "error");
            return;
        }

        try {
            const client = getSupabaseClient();
            const { error, data } = await client.auth.signInWithPassword({ email, password });
            if (error) throw error;
            this.currentUser = data.user;
            document.getElementById("technician").value = this.currentUser.email || "";
            this.updateAuthStatus();
            this.navigate("form");
            this.toast("Giriş yapıldı", "success");
        } catch (error) {
            console.error(error);
            this.toast(error.message || "Giriş yapılırken hata oluştu", "error");
        }
    },

    async signOut() {
        try {
            const client = getSupabaseClient();
            const { error } = await client.auth.signOut();
            if (error) throw error;
            this.currentUser = null;
            document.getElementById("technician").value = "";
            this.updateAuthStatus();
            this.navigate("auth");
            this.toast("Çıkış yapıldı", "success");
        } catch (error) {
            console.error(error);
            this.toast(error.message || "Çıkış yapılırken hata oluştu", "error");
        }
    },

    updateAuthStatus() {
        const status = document.getElementById("currentUserStatus");
        if (this.currentUser) {
            status.textContent = `Giriş yapan: ${this.currentUser.email}`;
        } else {
            status.textContent = "Giriş yapılmadı";
        }
    },

    toast(message, type = "") {
        const el = document.getElementById("toast");
        el.textContent = message;
        el.className = "toast" + (type ? " " + type : "");
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            el.classList.add("hidden");
        }, 2800);
    },

    confirm(title, message, onOk) {
        document.getElementById("confirmTitle").textContent = title;
        document.getElementById("confirmMessage").textContent = message;
        this.confirmCallback = onOk;
        document.getElementById("confirmModal").classList.remove("hidden");
    },

    hideConfirm() {
        document.getElementById("confirmModal").classList.add("hidden");
        this.confirmCallback = null;
    }
};

document.addEventListener("DOMContentLoaded", () => App.init());
