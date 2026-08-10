const App = {
    currentView: "form",
    confirmCallback: null,

    init() {
        Form.init();
        List.init();
        this.bindNavigation();
        this.bindSettings();
        List.render();
    },

    bindNavigation() {
        document.querySelectorAll("[data-nav]").forEach(el => {
            el.addEventListener("click", () => {
                const view = el.dataset.nav;
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

        document.getElementById("confirmCancel").addEventListener("click", () => this.hideConfirm());
        document.getElementById("confirmOk").addEventListener("click", () => {
            if (this.confirmCallback) this.confirmCallback();
            this.hideConfirm();
        });
        document.querySelector(".modal-backdrop").addEventListener("click", () => this.hideConfirm());
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
