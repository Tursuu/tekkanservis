const STORAGE_KEY = "tekkan_services";
const LEGACY_KEY = "services";

const Storage = {
    getAll() {
        try {
            let data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (data) return data;

            const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
            if (Array.isArray(legacy) && legacy.length) {
                const migrated = legacy.map(s => ({
                    ...s,
                    id: s.id || crypto.randomUUID(),
                    createdAt: s.createdAt || new Date().toISOString()
                }));
                this.saveAll(migrated);
                return migrated;
            }

            return [];
        } catch {
            return [];
        }
    },

    saveAll(services) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    },

    getById(id) {
        return this.getAll().find(s => s.id === id) || null;
    },

    add(service) {
        const services = this.getAll();
        services.unshift(service);
        this.saveAll(services);
        return service;
    },

    update(id, data) {
        const services = this.getAll();
        const index = services.findIndex(s => s.id === id);
        if (index === -1) return null;

        services[index] = { ...services[index], ...data, updatedAt: new Date().toISOString() };
        this.saveAll(services);
        return services[index];
    },

    remove(id) {
        const services = this.getAll().filter(s => s.id !== id);
        this.saveAll(services);
    },

    clear() {
        localStorage.removeItem(STORAGE_KEY);
    },

    nextServiceNo() {
        const services = this.getAll();
        let max = 0;

        services.forEach(s => {
            const num = parseInt(String(s.serviceNo).replace(/\D/g, ""), 10);
            if (!isNaN(num) && num > max) max = num;
        });

        return "SR-" + String(max + 1).padStart(5, "0");
    },

    exportJson() {
        return JSON.stringify(this.getAll(), null, 2);
    },

    async syncToSupabase() {
        const client = getSupabaseClient();
        const services = this.getAll();
        if (!services.length) return 0;

        const payload = services.map(s => ({
            id: s.id,
            service_no: s.serviceNo,
            technician: s.technician,
            date: s.date,
            departure: s.departure,
            arrival: s.arrival,
            start: s.start,
            finish: s.finish,
            total_time: s.totalTime,
            company: s.company,
            address: s.address,
            robot_type: s.robotType,
            robot_serial: s.robotSerial,
            job_types: s.jobTypes || [],
            oil: s.oil,
            take_out: s.takeOut,
            robot_cycle: s.robotCycle,
            inject_cycle: s.injectCycle,
            work_date: s.workDate,
            work_description: s.workDescription,
            report: s.report,
            parts: s.parts || [],
            created_at: s.createdAt || new Date().toISOString(),
            updated_at: s.updatedAt || new Date().toISOString()
        }));

        const { error } = await client.from(SupabaseConfig.table).upsert(payload, { onConflict: ["id"] });
        if (error) throw error;
        return services.length;
    },

    async syncFromSupabase() {
        const client = getSupabaseClient();
        const { data, error } = await client.from(SupabaseConfig.table).select("*");
        if (error) throw error;
        if (!Array.isArray(data)) return 0;

        const local = this.getAll();
        const localIds = new Set(local.map(s => s.id));
        const merged = [...local];

        data.forEach(item => {
            const record = {
                id: item.id || crypto.randomUUID(),
                serviceNo: item.service_no || item.serviceNo,
                technician: item.technician,
                date: item.date,
                departure: item.departure,
                arrival: item.arrival,
                start: item.start,
                finish: item.finish,
                totalTime: item.total_time || item.totalTime,
                company: item.company,
                address: item.address,
                robotType: item.robot_type || item.robotType,
                robotSerial: item.robot_serial || item.robotSerial,
                jobTypes: item.job_types || item.jobTypes || [],
                oil: item.oil,
                takeOut: item.take_out || item.takeOut,
                robotCycle: item.robot_cycle || item.robotCycle,
                injectCycle: item.inject_cycle || item.injectCycle,
                workDate: item.work_date || item.workDate,
                workDescription: item.work_description || item.workDescription,
                report: item.report,
                parts: item.parts || [],
                createdAt: item.created_at || item.createdAt || new Date().toISOString(),
                updatedAt: item.updated_at || item.updatedAt || new Date().toISOString()
            };

            if (localIds.has(record.id)) return;
            merged.push(record);
        });

        this.saveAll(merged);
        return data.length;
    },

    importJson(json) {
        const data = JSON.parse(json);
        if (!Array.isArray(data)) throw new Error("Geçersiz format");

        const existing = this.getAll();
        const existingIds = new Set(existing.map(s => s.id));

        data.forEach(item => {
            if (!item.id || existingIds.has(item.id)) {
                item.id = crypto.randomUUID();
            }
            existingIds.add(item.id);
        });

        this.saveAll([...data, ...existing]);
        return data.length;
    }
};
