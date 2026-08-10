const Form = {
    editingId: null,

    init() {
        this.bindEvents();
        this.resetForm();
    },

    bindEvents() {
        document.getElementById("addPartBtn").addEventListener("click", () => this.addPartRow());
        document.getElementById("saveServiceBtn").addEventListener("click", () => this.save());
        document.getElementById("headerSaveBtn").addEventListener("click", () => this.save());
        document.getElementById("clearBtn").addEventListener("click", () => this.confirmClear());

        document.getElementById("startTime").addEventListener("change", () => this.calculateDuration());
        document.getElementById("finishTime").addEventListener("change", () => this.calculateDuration());

        document.getElementById("partsList").addEventListener("click", (e) => {
            const btn = e.target.closest(".deletePart");
            if (!btn) return;

            const rows = document.querySelectorAll(".part-row");
            if (rows.length <= 1) {
                App.toast("En az bir parça satırı olmalı", "error");
                return;
            }
            btn.closest(".part-row").remove();
        });
    },

    resetForm() {
        this.editingId = null;
        document.getElementById("formTitle").textContent = "Yeni Servis Raporu";
        document.getElementById("formSubtitle").textContent = "Robot servis kaydı oluştur";

        document.getElementById("serviceNo").value = Storage.nextServiceNo();

        const today = new Date().toISOString().split("T")[0];
        document.getElementById("serviceDate").value = today;
        document.getElementById("workDate").value = today;

        const fields = [
            "technician", "departureTime", "arrivalTime", "startTime", "finishTime",
            "totalTime", "companyName", "companyAddress", "robotType", "robotSerial",
            "takeOut", "robotCycle", "injectCycle", "workDescription", "report"
        ];

        fields.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });

        document.querySelectorAll(".checkbox-grid input").forEach(cb => cb.checked = false);
        document.querySelector("input[name='oil'][value='Hayır']").checked = true;

        document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

        document.getElementById("partsList").innerHTML = "";
        this.addPartRow();
    },

    loadService(service) {
        this.editingId = service.id;
        document.getElementById("formTitle").textContent = "Raporu Düzenle";
        document.getElementById("formSubtitle").textContent = service.serviceNo;

        document.getElementById("serviceNo").value = service.serviceNo;
        document.getElementById("technician").value = service.technician || "";
        document.getElementById("serviceDate").value = service.date || "";
        document.getElementById("departureTime").value = service.departure || "";
        document.getElementById("arrivalTime").value = service.arrival || "";
        document.getElementById("startTime").value = service.start || "";
        document.getElementById("finishTime").value = service.finish || "";
        document.getElementById("totalTime").value = service.totalTime || "";
        document.getElementById("companyName").value = service.company || "";
        document.getElementById("companyAddress").value = service.address || "";
        document.getElementById("robotType").value = service.robotType || "";
        document.getElementById("robotSerial").value = service.robotSerial || "";
        document.getElementById("takeOut").value = service.takeOut || "";
        document.getElementById("robotCycle").value = service.robotCycle || "";
        document.getElementById("injectCycle").value = service.injectCycle || "";
        document.getElementById("workDate").value = service.workDate || "";
        document.getElementById("workDescription").value = service.workDescription || "";
        document.getElementById("report").value = service.report || "";

        document.querySelectorAll(".checkbox-grid input").forEach(cb => {
            cb.checked = service.jobTypes?.includes(cb.dataset.job) || false;
        });

        const oilVal = service.oil || "Hayır";
        const oilRadio = document.querySelector(`input[name='oil'][value='${oilVal}']`);
        if (oilRadio) oilRadio.checked = true;

        const partsList = document.getElementById("partsList");
        partsList.innerHTML = "";

        if (service.parts?.length) {
            service.parts.forEach(p => this.addPartRow(p));
        } else {
            this.addPartRow();
        }

        App.navigate("form");
        window.scrollTo(0, 0);
    },

    addPartRow(data = {}) {
        const row = document.createElement("div");
        row.className = "part-row";
        row.innerHTML = `
            <button type="button" class="deletePart"><i class="fa-solid fa-trash"></i></button>
            <div class="part-fields">
                <input type="text" class="part-no" placeholder="Parça No" value="${escapeAttr(data.partNo || "")}">
                <div class="grid grid-2">
                    <input type="number" class="part-qty" placeholder="Miktar" inputmode="numeric" value="${escapeAttr(data.quantity || "")}">
                    <input type="text" class="part-desc" placeholder="Açıklama" value="${escapeAttr(data.description || "")}">
                </div>
            </div>
        `;
        document.getElementById("partsList").appendChild(row);
    },

    calculateDuration() {
        const start = document.getElementById("startTime").value;
        const finish = document.getElementById("finishTime").value;
        if (!start || !finish) return;

        const [sh, sm] = start.split(":").map(Number);
        const [fh, fm] = finish.split(":").map(Number);

        let startMin = sh * 60 + sm;
        let finishMin = fh * 60 + fm;
        let diff = finishMin - startMin;
        if (diff < 0) diff += 24 * 60;

        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        document.getElementById("totalTime").value = `${hours} Saat ${minutes} Dakika`;
    },

    collectData() {
        const jobTypes = [];
        document.querySelectorAll(".checkbox-grid input:checked").forEach(cb => {
            jobTypes.push(cb.dataset.job);
        });

        const oil = document.querySelector("input[name='oil']:checked");

        const parts = [];
        document.querySelectorAll(".part-row").forEach(row => {
            parts.push({
                partNo: row.querySelector(".part-no").value.trim(),
                quantity: row.querySelector(".part-qty").value.trim(),
                description: row.querySelector(".part-desc").value.trim()
            });
        });

        return {
            serviceNo: document.getElementById("serviceNo").value,
            technician: document.getElementById("technician").value,
            date: document.getElementById("serviceDate").value,
            departure: document.getElementById("departureTime").value,
            arrival: document.getElementById("arrivalTime").value,
            start: document.getElementById("startTime").value,
            finish: document.getElementById("finishTime").value,
            totalTime: document.getElementById("totalTime").value,
            company: document.getElementById("companyName").value.trim(),
            address: document.getElementById("companyAddress").value.trim(),
            robotType: document.getElementById("robotType").value.trim(),
            robotSerial: document.getElementById("robotSerial").value.trim(),
            jobTypes,
            oil: oil ? oil.value : "",
            takeOut: document.getElementById("takeOut").value,
            robotCycle: document.getElementById("robotCycle").value,
            injectCycle: document.getElementById("injectCycle").value,
            workDate: document.getElementById("workDate").value,
            workDescription: document.getElementById("workDescription").value.trim(),
            report: document.getElementById("report").value.trim(),
            parts
        };
    },

    validate(data) {
        let valid = true;
        const required = [
            { id: "technician", value: data.technician },
            { id: "serviceDate", value: data.date },
            { id: "companyName", value: data.company }
        ];

        document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

        required.forEach(({ id, value }) => {
            const el = document.getElementById(id);
            if (!value) {
                el.classList.add("invalid");
                valid = false;
            }
        });

        if (!valid) {
            App.toast("Lütfen zorunlu alanları doldurun", "error");
            const first = document.querySelector(".invalid");
            first?.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        return valid;
    },

    save() {
        const data = this.collectData();
        if (!this.validate(data)) return;

        if (this.editingId) {
            Storage.update(this.editingId, data);
            App.toast("Rapor güncellendi", "success");
        } else {
            Storage.add({
                id: crypto.randomUUID(),
                ...data,
                createdAt: new Date().toISOString()
            });
            App.toast("Servis kaydedildi", "success");
        }

        List.render();
        this.resetForm();
        App.navigate("list");
    },

    confirmClear() {
        if (this.editingId) {
            App.confirm("Formu temizle", "Düzenleme iptal edilecek. Emin misiniz?", () => {
                this.resetForm();
                App.toast("Form temizlendi");
            });
        } else {
            this.resetForm();
            App.toast("Form temizlendi");
        }
    }
};

function escapeAttr(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
