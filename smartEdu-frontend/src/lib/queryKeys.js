export const queryKeys = {
  //  Guru
  guru: {
    all: ["guru"],
    lists: () => [...queryKeys.guru.all, "list"],
    list: (params) => [...queryKeys.guru.lists(), params],
    detail: (id) => [...queryKeys.guru.all, "detail", id],
  },

  //  Siswa
  siswa: {
    all: ["siswa"],
    lists: () => [...queryKeys.siswa.all, "list"],
    list: (params) => [...queryKeys.siswa.lists(), params],
    detail: (id) => [...queryKeys.siswa.all, "detail", id],
  },

  // Kelas 
  kelas: {
    all: ["kelas"],
    lists: () => [...queryKeys.kelas.all, "list"],
    list: (params) => [...queryKeys.kelas.lists(), params],
    detail: (id) => [...queryKeys.kelas.all, "detail", id],
  },

  // Mata Pelajaran 
  mapel: {
    all: ["mapel"],
    lists: () => [...queryKeys.mapel.all, "list"],
    list: (params) => [...queryKeys.mapel.lists(), params],
    detail: (id) => [...queryKeys.mapel.all, "detail", id],
  },

  // Pembayaran 
  pembayaran: {
    all: ["pembayaran"],
    lists: () => [...queryKeys.pembayaran.all, "list"],
    list: (params) => [...queryKeys.pembayaran.lists(), params],
    detail: (id) => [...queryKeys.pembayaran.all, "detail", id],
  },

  // Dashboard
  dashboard: {
    admin: ["dashboard", "admin"],
    guru: ["dashboard", "guru"],
    siswa: ["dashboard", "siswa"],
  },
};
