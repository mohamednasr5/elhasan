
import { AppState } from './types';

const DB_KEY = 'al_hasan_pos_db';

const INITIAL_STATE: AppState = {
  products: [],
  sales: [],
  repairs: [],
  expenses: [],
  purchases: [],
  currentUser: null,
  categories: ['إكسسوارات', 'شواحن', 'بطاريات', 'شاشات', 'صيانة'],
  brands: ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Oppo'],
  suppliers: ['المورد العام'],
  isOffline: !navigator.onLine,
};

export const db = {
  get: (): AppState => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : INITIAL_STATE;
  },
  
  save: (state: AppState) => {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
  },

  seed: () => {
    const state = db.get();
    if (state.products.length === 0) {
      state.products = [
        {
          id: '1',
          name: 'شاشة ايفون 11 برو',
          sku: 'SCR-IP11P',
          barcode: '123456789',
          category: 'شاشات',
          brand: 'Apple',
          costPrice: 1500,
          salePrice: 2200,
          stockQty: 5,
          minStockAlert: 2,
          createdAt: Date.now()
        }
      ];
      db.save(state);
    }
  }
};
