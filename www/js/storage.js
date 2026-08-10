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
