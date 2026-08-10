const PDF = {
    generate(service) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        const margin = 18;
        let y = margin;

        const line = (text, size = 10, bold = false, color = [45, 52, 54]) => {
            doc.setFontSize(size);
            doc.setFont("helvetica", bold ? "bold" : "normal");
            doc.setTextColor(...color);
            const lines = doc.splitTextToSize(text, 210 - margin * 2);
            doc.text(lines, margin, y);
            y += lines.length * (size * 0.45) + 3;
        };

        const section = (title) => {
            y += 4;
            doc.setFillColor(21, 101, 192);
            doc.rect(margin, y - 5, 210 - margin * 2, 8, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(title, margin + 3, y);
            y += 10;
            doc.setTextColor(45, 52, 54);
        };

        const field = (label, value) => {
            if (!value && value !== 0) return;
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(100, 116, 139);
            doc.text(label, margin, y);
            y += 4;
            doc.setFont("helvetica", "normal");
            doc.setTextColor(45, 52, 54);
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(String(value), 210 - margin * 2);
            doc.text(lines, margin, y);
            y += lines.length * 5 + 4;
        };

        doc.setFillColor(21, 101, 192);
        doc.rect(0, 0, 210, 28, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("TEKKAN SERVIS RAPORU", margin, 14);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(service.serviceNo + "  |  " + formatDate(service.date), margin, 22);

        y = 38;

        section("Servis Bilgileri");
        field("Servis Yetkilisi", service.technician);
        field("Tarih", formatDate(service.date));
        field("Hareket Saati", service.departure);
        field("Varis Saati", service.arrival);
        field("Is Baslama", service.start);
        field("Is Bitis", service.finish);
        field("Toplam Sure", service.totalTime);

        section("Firma Bilgileri");
        field("Firma Adi", service.company);
        field("Adres", service.address);

        section("Robot Bilgileri");
        field("Robot Tipi", service.robotType);
        field("Seri No", service.robotSerial);

        if (service.jobTypes?.length) {
            section("Is Degerlendirme");
            field("Secilenler", service.jobTypes.join(", "));
        }

        section("Yag Ihtiyaci");
        field("Durum", service.oil || "Belirtilmedi");

        section("Cevrim Sureleri");
        field("Take Out", service.takeOut ? service.takeOut + " sn" : "");
        field("Robot Cevrim", service.robotCycle ? service.robotCycle + " sn" : "");
        field("Enjeksiyon", service.injectCycle ? service.injectCycle + " sn" : "");

        if (service.parts?.some(p => p.partNo || p.description)) {
            section("Yedek Parcalar");
            doc.autoTable({
                startY: y,
                margin: { left: margin, right: margin },
                head: [["Parca No", "Miktar", "Aciklama"]],
                body: service.parts
                    .filter(p => p.partNo || p.description) 
                    .map(p => [p.partNo || "-", p.quantity || "-", p.description || "-"]),
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [21, 101, 192] }
            });
            y = doc.lastAutoTable.finalY + 8;
        }

        if (y > 240) {
            doc.addPage();
            y = margin;
        }

        section("Calisma Durumu");
        field("Tarih", formatDate(service.workDate));
        field("Aciklama", service.workDescription);

        section("Ariza / Calisma Raporu");
        if (service.report) {
            doc.setFontSize(10);
            const reportLines = doc.splitTextToSize(service.report, 210 - margin * 2);
            doc.text(reportLines, margin, y);
        }

        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                "Olusturulma: " + new Date().toLocaleString("tr-TR") + "  |  Sayfa " + i + "/" + pageCount,
                margin,
                290
            );
        }

        return doc;
    },

    download(service) {
        const doc = this.generate(service);
        doc.save(service.serviceNo + "_" + (service.company || "rapor").replace(/\s+/g, "_") + ".pdf");
    },

    async share(service) {
        const doc = this.generate(service);
        const blob = doc.output("blob");
        const fileName = service.serviceNo + ".pdf";

        if (navigator.share && navigator.canShare?.({ files: [new File([blob], fileName, { type: "application/pdf" })] })) {
            const file = new File([blob], fileName, { type: "application/pdf" });
            await navigator.share({
                title: "Tekkan Servis Raporu - " + service.serviceNo,
                files: [file]
            });
        } else {
            this.download(service);
        }
    }
};

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}
