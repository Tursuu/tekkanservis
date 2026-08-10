const List = {
    currentDetailId: null,
    searchQuery: "",

    init() {
        document.getElementById("searchInput").addEventListener("input", (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.render();
        });

        document.getElementById("detailEditBtn").addEventListener("click", () => {
            const service = Storage.getById(this.currentDetailId);
            if (service) Form.loadService(service);
        });

        document.getElementById("detailDeleteBtn").addEventListener("click", () => {
            App.confirm("Kaydı Sil", "Bu servis raporu kalıcı olarak silinecek.", () => {
                Storage.remove(this.currentDetailId);
                this.currentDetailId = null;
                this.render();
                App.navigate("list");
                App.toast("Kayıt silindi");
            });
        });

        document.getElementById("detailPdfBtn").addEventListener("click", () => {
            const service = Storage.getById(this.currentDetailId);
            if (service) PDF.download(service);
        });

        document.getElementById("detailShareBtn").addEventListener("click", async () => {
            const service = Storage.getById(this.currentDetailId);
            if (!service) return;
            try {
                await PDF.share(service);
            } catch {
                PDF.download(service);
            }
        });
    },

    getFiltered() {
        const services = Storage.getAll();
        if (!this.searchQuery) return services;

        return services.filter(s => {
            const haystack = [
                s.serviceNo, s.company, s.technician, s.robotSerial, s.robotType
            ].join(" ").toLowerCase();
            return haystack.includes(this.searchQuery);
        });
    },

    render() {
        const services = this.getFiltered();
        const listEl = document.getElementById("servicesList");
        const emptyEl = document.getElementById("emptyList");

        document.getElementById("listCount").textContent = `${Storage.getAll().length} kayıt`;

        if (services.length === 0) {
            listEl.innerHTML = "";
            emptyEl.classList.toggle("hidden", Storage.getAll().length > 0);
            return;
        }

        emptyEl.classList.add("hidden");

        listEl.innerHTML = services.map(s => `
            <div class="service-card" data-id="${s.id}">
                <div class="service-card-top">
                    <span class="service-card-no">${escapeHtml(s.serviceNo)}</span>
                    <span class="service-card-date">${formatDate(s.date)}</span>
                </div>
                <h3>${escapeHtml(s.company || "Firma belirtilmedi")}</h3>
                <div class="service-card-meta">
                    <span><i class="fa-solid fa-user"></i> ${escapeHtml(s.technician || "-")}</span>
                    ${s.robotType ? `<span><i class="fa-solid fa-robot"></i> ${escapeHtml(s.robotType)}</span>` : ""}
                    ${s.totalTime ? `<span><i class="fa-solid fa-clock"></i> ${escapeHtml(s.totalTime)}</span>` : ""}
                </div>
                ${s.jobTypes?.length ? `
                    <div class="job-tags">
                        ${s.jobTypes.slice(0, 3).map(j => `<span class="job-tag">${escapeHtml(j)}</span>`).join("")}
                        ${s.jobTypes.length > 3 ? `<span class="job-tag">+${s.jobTypes.length - 3}</span>` : ""}
                    </div>
                ` : ""}
            </div>
        `).join("");

        listEl.querySelectorAll(".service-card").forEach(card => {
            card.addEventListener("click", () => {
                this.showDetail(card.dataset.id);
            });
        });
    },

    showDetail(id) {
        const service = Storage.getById(id);
        if (!service) return;

        this.currentDetailId = id;
        document.getElementById("detailTitle").textContent = service.serviceNo;
        document.getElementById("detailSubtitle").textContent = service.company || "";

        document.getElementById("detailContent").innerHTML = `
            ${detailSection("Servis Bilgileri", "fa-user-gear", [
                ["Servis Yetkilisi", service.technician],
                ["Tarih", formatDate(service.date)],
                ["Hareket", service.departure],
                ["Varış", service.arrival],
                ["Başlangıç", service.start],
                ["Bitiş", service.finish],
                ["Toplam Süre", service.totalTime]
            ])}

            ${detailSection("Firma", "fa-building", [
                ["Firma Adı", service.company],
                ["Adres", service.address]
            ])}

            ${detailSection("Robot", "fa-microchip", [
                ["Tip", service.robotType],
                ["Seri No", service.robotSerial]
            ])}

            ${service.jobTypes?.length ? detailSection("İş Değerlendirme", "fa-clipboard-check", [
                ["Seçilenler", service.jobTypes.join(", ")]
            ]) : ""}

            ${detailSection("Yağ İhtiyacı", "fa-oil-can", [
                ["Durum", service.oil || "Belirtilmedi"]
            ])}

            ${detailSection("Çevrim Süreleri", "fa-stopwatch", [
                ["Take Out", service.takeOut ? service.takeOut + " sn" : "-"],
                ["Robot Çevrim", service.robotCycle ? service.robotCycle + " sn" : "-"],
                ["Enjeksiyon", service.injectCycle ? service.injectCycle + " sn" : "-"]
            ])}

            ${service.parts?.some(p => p.partNo || p.description) ? `
                <div class="detail-section">
                    <h3><i class="fa-solid fa-gears"></i> Yedek Parçalar</h3>
                    <table class="parts-table-mini">
                        <thead><tr><th>Parça No</th><th>Miktar</th><th>Açıklama</th></tr></thead>
                        <tbody>
                            ${service.parts.filter(p => p.partNo || p.description).map(p => `
                                <tr>
                                    <td>${escapeHtml(p.partNo || "-")}</td>
                                    <td>${escapeHtml(p.quantity || "-")}</td>
                                    <td>${escapeHtml(p.description || "-")}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            ` : ""}

            ${detailSection("Çalışma Durumu", "fa-business-time", [
                ["Tarih", formatDate(service.workDate)],
                ["Açıklama", service.workDescription]
            ])}

            ${service.report ? `
                <div class="detail-section">
                    <h3><i class="fa-solid fa-file-lines"></i> Arıza / Çalışma Raporu</h3>
                    <p style="white-space:pre-wrap;line-height:1.6;font-size:15px;">${escapeHtml(service.report)}</p>
                </div>
            ` : ""}
        `;

        App.navigate("detail");
    }
};

function detailSection(title, icon, fields) {
    const items = fields
        .filter(([, val]) => val)
        .map(([label, val]) => `
            <div class="detail-item ${label.includes("Adres") || label.includes("Seçilenler") ? "full" : ""}">
                <label>${label}</label>
                <span>${escapeHtml(String(val))}</span>
            </div>
        `).join("");

    if (!items) return "";

    return `
        <div class="detail-section">
            <h3><i class="fa-solid ${icon}"></i> ${title}</h3>
            <div class="detail-grid">${items}</div>
        </div>
    `;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
