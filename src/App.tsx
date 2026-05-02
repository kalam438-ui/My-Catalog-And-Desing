/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Trash2, Upload, UtensilsCrossed, Check, ChevronUp, ChevronDown, Edit2, MessageCircle, Globe, Sparkles, Loader2, X, Bot, Send, LogIn, LogOut, ExternalLink, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, orderBy, updateDoc } from 'firebase/firestore';

type Language = 'en' | 'ar' | 'bn';

const translations = {
  en: {
    restaurantName: 'Restaurant Name',
    menuTitle: 'Menu Title',
    addDish: 'Add Dish',
    addCategory: 'Category',
    editHeader: 'Edit Header',
    shareMenu: 'Share Menu',
    shareWhatsApp: 'WhatsApp',
    cancel: 'Cancel',
    save: 'Save',
    update: 'Update',
    category: 'Category',
    dishName: 'Dish Name',
    price: 'Price',
    description: 'Description',
    bestSeller: 'Best Seller?',
    uploadImage: 'Click to upload image',
    emptyMenu: 'Your menu is empty',
    startAdding: 'Start adding dishes',
    linkCopied: 'Link copied to clipboard!',
    selectCategory: 'Select a category',
    editCategory: 'Edit Category',
    addNewCategory: 'Add New Category',
    editingHeader: 'Editing Menu Header',
    editingDish: 'Editing Dish',
    addNewDish: 'Add New Dish to Menu',
    bestSellerBadge: 'Best Seller',
    fineDining: 'Fine Dining',
    est: 'Est. 1994',
    placeholderDish: 'e.g. Butter Chicken',
    placeholderDesc: 'Briefly describe the dish...',
    placeholderCat: 'e.g. Desserts',
    order: 'Order',
    whatsappNumber: 'WhatsApp Number (with country code)',
    translateMenu: 'Translate Content',
    translating: 'Translating...',
    translateSuccess: 'Menu translated successfully!',
    translateError: 'Translation failed. Please try again.',
    currencySymbol: '$',
    dishImage: 'Dish Image',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    editCategoryName: 'Edit Category Name',
    removeCategory: 'Remove Category',
    edit: 'Edit',
    delete: 'Delete',
    aiAssistant: 'AI Assistant',
    online: 'Online',
    chatPlaceholder: 'Ask about our menu...',
    chatWelcome: 'How can I help you today?',
    shareOnWhatsApp: 'Share on WhatsApp',
    suggestBestSeller: 'What is your best seller?',
    suggestVegetarian: 'Any vegetarian options?',
    suggestPrice: 'What is the cheapest dish?',
    removeImage: 'Remove Image',
    fillAllFields: 'Please fill all required fields',
    searchPlaceholder: 'Search dishes, descriptions or categories...',
  },
  ar: {
    restaurantName: 'اسم المطعم',
    menuTitle: 'عنوان القائمة',
    addDish: 'إضافة طبق',
    addCategory: 'فئة',
    editHeader: 'تعديل الهيدر',
    shareMenu: 'مشاركة القائمة',
    shareWhatsApp: 'واتساب',
    cancel: 'إلغاء',
    save: 'حفظ',
    update: 'تحديث',
    category: 'الفئة',
    dishName: 'اسم الطبق',
    price: 'السعر',
    description: 'الوصف',
    bestSeller: 'الأكثر مبيعاً؟',
    uploadImage: 'انقر لتحميل صورة',
    emptyMenu: 'قائمتك فارغة',
    startAdding: 'ابدأ بإضافة الأطباق',
    linkCopied: 'تم نسخ الرابط!',
    selectCategory: 'اختر فئة',
    editCategory: 'تعديل الفئة',
    addNewCategory: 'إضافة فئة جديدة',
    editingHeader: 'تعديل هيدر القائمة',
    editingDish: 'تعديل الطبق',
    addNewDish: 'إضافة طبق جديد للقائمة',
    bestSellerBadge: 'الأكثر مبيعاً',
    fineDining: 'عشاء فاخر',
    est: 'تأسس عام ١٩٩٤',
    placeholderDish: 'مثلاً: دجاج بالزبدة',
    placeholderDesc: 'صف الطبق باختصار...',
    placeholderCat: 'مثلاً: حلويات',
    order: 'طلب',
    whatsappNumber: 'رقم الواتساب (مع رمز الدولة)',
    translateMenu: 'ترجمة المحتوى',
    translating: 'جاري الترجمة...',
    translateSuccess: 'تمت ترجمة القائمة بنجاح!',
    translateError: 'فشلت الترجمة. يرجى المحاولة مرة أخرى.',
    currencySymbol: '$',
    dishImage: 'صورة الطبق',
    moveUp: 'تحريك لأعلى',
    moveDown: 'تحريك لأسفل',
    editCategoryName: 'تعديل اسم الفئة',
    removeCategory: 'إزالة الفئة',
    edit: 'تعديل',
    delete: 'حذف',
    aiAssistant: 'مساعد ذكي',
    online: 'متصل',
    chatPlaceholder: 'اسأل عن قائمتنا...',
    chatWelcome: 'كيف يمكنني مساعدتك اليوم؟',
    shareOnWhatsApp: 'مشاركة عبر واتساب',
    suggestBestSeller: 'ما هو الطبق الأكثر مبيعاً؟',
    suggestVegetarian: 'هل توجد خيارات نباتية؟',
    suggestPrice: 'ما هو أرخص طبق؟',
    removeImage: 'إزالة الصورة',
    fillAllFields: 'يرجى ملء جميع الحقول المطلوبة',
    searchPlaceholder: 'بحث في الأطباق أو الوصف أو الفئات...',
  },
  bn: {
    restaurantName: 'রেস্তোরাঁর নাম',
    menuTitle: 'মেনু শিরোনাম',
    addDish: 'ডিশ যোগ করুন',
    addCategory: 'বিভাগ',
    editHeader: 'হেডার এডিট করুন',
    shareMenu: 'মেনু শেয়ার করুন',
    shareWhatsApp: 'হোয়াটসঅ্যাপ',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ',
    update: 'আপডেট',
    category: 'বিভাগ',
    dishName: 'ডিশের নাম',
    price: 'মূল্য',
    description: 'বর্ণনা',
    bestSeller: 'সেরা বিক্রেতা?',
    uploadImage: 'ছবি আপলোড করতে ক্লিক করুন',
    emptyMenu: 'আপনার মেনু খালি',
    startAdding: 'ডিশ যোগ করা শুরু করুন',
    linkCopied: 'লিঙ্ক কপি করা হয়েছে!',
    selectCategory: 'একটি বিভাগ নির্বাচন করুন',
    editCategory: 'বিভাগ এডিট করুন',
    addNewCategory: 'নতুন বিভাগ যোগ করুন',
    editingHeader: 'মেনু হেডার এডিট করা হচ্ছে',
    editingDish: 'ডিশ এডিট করা হচ্ছে',
    addNewDish: 'মেনুতে নতুন ডিশ যোগ করুন',
    bestSellerBadge: 'সেরা বিক্রেতা',
    fineDining: 'ফাইন ডাইনিং',
    est: 'প্রতিষ্ঠিত ১৯৯৪',
    placeholderDish: 'উদাঃ বাটার চিকেন',
    placeholderDesc: 'সংক্ষেপে ডিশটি বর্ণনা করুন...',
    placeholderCat: 'উদাঃ ডেজার্ট',
    order: 'অর্ডার',
    whatsappNumber: 'হোয়াটসঅ্যাপ নম্বর (কান্ট্রি কোড সহ)',
    translateMenu: 'কন্টেন্ট অনুবাদ করুন',
    translating: 'অনুবাদ করা হচ্ছে...',
    translateSuccess: 'মেনু সফলভাবে অনুবাদ করা হয়েছে!',
    translateError: 'অনুবাদ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
    currencySymbol: '৳',
    dishImage: 'ডিশের ছবি',
    moveUp: 'উপরে সরান',
    moveDown: 'নিচে সরান',
    editCategoryName: 'বিভাগের নাম এডিট করুন',
    removeCategory: 'বিভাগ সরান',
    edit: 'এডিট',
    delete: 'মুছে ফেলুন',
    aiAssistant: 'এআই সহকারী',
    online: 'অনলাইন',
    chatPlaceholder: 'আমাদের মেনু সম্পর্কে জিজ্ঞাসা করুন...',
    chatWelcome: 'আমি আজ আপনাকে কিভাবে সাহায্য করতে পারি?',
    shareOnWhatsApp: 'হোয়াটসঅ্যাপে শেয়ার করুন',
    suggestBestSeller: 'আপনাদের সেরা ডিশ কোনটি?',
    suggestVegetarian: 'নিরামিষ কোনো অপশন আছে কি?',
    suggestPrice: 'সবচেয়ে সস্তা ডিশ কোনটি?',
    removeImage: 'ছবি সরান',
    fillAllFields: 'অনুগ্রহ করে সব প্রয়োজনীয় ক্ষেত্র পূরণ করুন',
    searchPlaceholder: 'ডিশ, বর্ণনা বা বিভাগ অনুসন্ধান করুন...',
  }
};
interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
  isBestSeller?: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const isViewOnly = queryParams.get('mode') === 'view';

  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const isLoading = isLoadingItems || isLoadingCategories;

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({ name: '', image: '', description: '' });
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('menu_language');
    return (saved as Language) || 'en';
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const t = translations[language];
  const isNonLatin = ['ar', 'bn'].includes(language);

  const [headerInfo, setHeaderInfo] = useState({
    restaurant: 'LARANA & CO',
    title: 'MENU',
    whatsapp: ''
  });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firebase Sync
  useEffect(() => {
    // For view-only mode, we can start syncing immediately without waiting for auth
    if (!isAuthReady && !isViewOnly) return;

    const unsubItems = onSnapshot(collection(db, 'menu_items'), (snapshot) => {
      const newItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
      setItems(newItems);
      setIsLoadingItems(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'menu_items');
      setIsLoadingItems(false);
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const newCats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(newCats);
      setIsLoadingCategories(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
      setIsLoadingCategories(false);
    });

    const unsubHeader = onSnapshot(doc(db, 'header', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setHeaderInfo(snapshot.data() as any);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'header/main'));

    return () => {
      unsubItems();
      unsubCategories();
      unsubHeader();
    };
  }, [isAuthReady, isViewOnly]);

  useEffect(() => {
    localStorage.setItem('menu_language', language);
  }, [language]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  
  // Track previous language to trigger translation
  const prevLanguageRef = useRef<Language>(language);

  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'item' | 'category', name?: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (prevLanguageRef.current !== language) {
      translateMenuContent();
      prevLanguageRef.current = language;
    }
  }, [language]);

  // Auto-greeting when chat opens
  useEffect(() => {
    if (isChatOpen && chatMessages.length === 0) {
      const sendGreeting = async () => {
        setIsChatLoading(true);
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
              { role: 'user', parts: [{ text: `You are an AI assistant for ${headerInfo.restaurant}. 
              The customer just opened the chat. Give a very brief, warm greeting in ${language} and invite them to ask about the menu.` }] }
            ],
          });
          const aiMessage: ChatMessage = { role: 'model', text: response.text || t.chatWelcome };
          setChatMessages([aiMessage]);
        } catch (error) {
          setChatMessages([{ role: 'model', text: t.chatWelcome }]);
        } finally {
          setIsChatLoading(false);
        }
      };
      sendGreeting();
    }
  }, [isChatOpen]);
  
  // Detect view-only mode from URL
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    price: '',
    description: '',
    image: '',
    category: '',
    isBestSeller: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        
        // Compress image to ensure it stays under Firestore's 1MB limit
        const img = new Image();
        img.src = base64;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Using JPEG with 0.7 quality to significantly reduce file size
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setNewItem(prev => ({ ...prev, image: compressedBase64 }));
        };
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        
        const img = new Image();
        img.src = base64;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setNewCategory(prev => ({ ...prev, image: compressedBase64 }));
        };
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const addItem = async () => {
    if (!user) return;
    if (!newItem.name || !newItem.price || !newItem.category) {
      setToastMessage(t.fillAllFields || 'Please fill all required fields');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    const id = editingId || Date.now().toString();
    const itemData = {
      id,
      name: newItem.name,
      price: newItem.price,
      description: newItem.description || '',
      image: newItem.image || '',
      category: newItem.category,
      isBestSeller: newItem.isBestSeller || false,
      authorUid: user.uid
    };

    try {
      await setDoc(doc(db, 'menu_items', id), itemData);
      setNewItem({ name: '', price: '', description: '', image: '', category: '', isBestSeller: false });
      setEditingId(null);
      setIsAdding(false);
      setIsAddingCategory(false);
      setIsEditingHeader(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `menu_items/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const editItem = (item: MenuItem) => {
    if (isViewOnly || !user) return;
    setNewItem(item);
    setEditingId(item.id);
    setIsAdding(true);
    setIsAddingCategory(false);
    setIsEditingHeader(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeItem = async (id: string) => {
    if (isViewOnly || !user || !id) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, 'menu_items', id));
      setConfirmDelete(null);
      if (editingId === id) {
        setEditingId(null);
        setNewItem({ name: '', price: '', description: '', image: '', category: '', isBestSeller: false });
        setIsAdding(false);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `menu_items/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleForm = () => {
    if (isViewOnly) return;
    if (isAdding) {
      setIsAdding(false);
      setEditingId(null);
      setIsEditingHeader(false);
      setIsAddingCategory(false);
      setNewItem({ name: '', price: '', description: '', image: '', category: '', isBestSeller: false });
      setNewCategory({ name: '', image: '', description: '' });
    } else {
      setIsAdding(true);
    }
  };

  const addCategory = async () => {
    if (!user) return;
    if (!newCategory.name) {
      setToastMessage(t.fillAllFields || 'Please fill all required fields');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    const categoryId = newCategory.name.toLowerCase().replace(/\s+/g, '_');
    
    try {
      // If we are editing and the name changed, we need to handle the old document and items
      if (editingCategoryIndex !== null) {
        const oldCategory = categories[editingCategoryIndex];
        const oldCategoryId = oldCategory.id;
        const oldName = oldCategory.name;
        const newName = newCategory.name;
        
        if (oldName !== newName) {
          // Update items that were in the old category
          const itemsToUpdate = items.filter(item => item.category === oldName);
          for (const item of itemsToUpdate) {
            await setDoc(doc(db, 'menu_items', item.id), { ...item, category: newName }, { merge: true });
          }

          if (oldCategoryId !== categoryId) {
            // Delete old document if ID changed
            await deleteDoc(doc(db, 'categories', oldCategoryId));
          }
        }
      }

      await setDoc(doc(db, 'categories', categoryId), {
        id: categoryId,
        name: newCategory.name,
        description: newCategory.description || '',
        image: newCategory.image || '',
        authorUid: user.uid
      });
      
      setEditingCategoryIndex(null);
      setNewCategory({ name: '', image: '', description: '' });
      setIsAddingCategory(false);
      setIsAdding(false);
      setIsEditingHeader(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${categoryId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const editCategory = (index: number) => {
    if (isViewOnly || !user) return;
    setNewCategory(categories[index]);
    setEditingCategoryIndex(index);
    setIsAddingCategory(true);
    setIsAdding(true);
    setIsEditingHeader(false);
    setEditingId(null);
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    if (isViewOnly || !user) return;
    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    
    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
    setCategories(newCategories);
    // Note: In a real app, you'd store an 'order' field in Firestore
  };

  const removeCategory = async (categoryId: string) => {
    if (isViewOnly || !user || !categoryId) return;
    setIsSaving(true);
    try {
      const categoryToDelete = categories.find(c => c.id === categoryId);
      await deleteDoc(doc(db, 'categories', categoryId));
      
      // Update items that were in this category to be uncategorized
      if (categoryToDelete) {
        const itemsToUpdate = items.filter(item => item.category === categoryToDelete.name);
        for (const item of itemsToUpdate) {
          await updateDoc(doc(db, 'menu_items', item.id), { category: '' });
        }
      }
      
      setConfirmDelete(null);
      if (editingCategoryIndex !== null && categories[editingCategoryIndex]?.id === categoryId) {
        setEditingCategoryIndex(null);
        setNewCategory({ name: '', image: '', description: '' });
        setIsAddingCategory(false);
        setIsAdding(false);
      }
      
      setToastMessage("Category deleted successfully");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveHeader = async () => {
    if (!user) {
      setToastMessage('Please sign in to save changes');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    
    if (!headerInfo.restaurant || !headerInfo.title) {
      setToastMessage(t.fillAllFields || 'Please fill all required fields');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, 'header', 'main'), {
        ...headerInfo,
        authorUid: user.uid
      });
      setIsAdding(false);
      setIsEditingHeader(false);
      setIsAddingCategory(false);
      setToastMessage('Header saved successfully!');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'header/main');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleHeaderEdit = () => {
    if (isViewOnly || !user) return;
    const nextState = !isEditingHeader;
    setIsEditingHeader(nextState);
    if (nextState) {
      setIsAdding(true);
      setEditingId(null);
      setIsAddingCategory(false);
    } else {
      setIsAdding(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const copyShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'view');
    navigator.clipboard.writeText(url.toString());
    setToastMessage(t.linkCopied);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'view');
    window.open(url.toString(), '_blank');
  };

  const translateMenuContent = async () => {
    if (isTranslating) return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Translate the following restaurant menu content into ${language}. 
        Return ONLY a JSON object with the following structure:
        {
          "headerInfo": { "restaurant": "...", "title": "..." },
          "categories": [
            { "id": "...", "name": "...", "description": "..." },
            ...
          ],
          "items": [
            { "id": "...", "name": "...", "description": "...", "price": "...", "category": "..." },
            ...
          ]
        }
        
        CRITICAL: 
        1. Do NOT translate IDs or any other technical fields. Only translate the visible text content.
        2. For prices, ensure they are formatted correctly for the target language if applicable, but keep the numeric value accurate.
        3. If a field is missing or empty, return it as an empty string.
        4. Translate everything naturally for a restaurant menu in ${language}.
        
        Content to translate:
        Header: ${JSON.stringify(headerInfo)}
        Categories: ${JSON.stringify(categories.map(({ id, name, description }) => ({ id, name, description: description || '' })))}
        Items: ${JSON.stringify(items.map(({ id, name, description, price, category }) => ({ id, name, description, price, category })))}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');

      if (result.headerInfo) setHeaderInfo(prev => ({ ...prev, ...result.headerInfo }));
      if (result.categories) {
        setCategories(prev => prev.map(cat => {
          const translated = result.categories.find((c: any) => c.id === cat.id);
          return translated ? { ...cat, name: translated.name, description: translated.description } : cat;
        }));
      }
      if (result.items) {
        setItems(prev => prev.map(item => {
          const translated = result.items.find((i: any) => i.id === item.id);
          return translated ? { ...item, ...translated } : item;
        }));
      }
      setToastMessage(t.translateSuccess);
    } catch (error) {
      console.error("Translation error:", error);
      setToastMessage(t.translateError);
    } finally {
      setIsTranslating(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const shareOnWhatsApp = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('mode', 'view');
    const text = `${headerInfo.restaurant} - ${headerInfo.title}\n\nCheck out our menu: ${url.toString()}`;
    const waUrl = headerInfo.whatsapp 
      ? `https://wa.me/${headerInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const orderItemOnWhatsApp = (item: MenuItem) => {
    if (!headerInfo.whatsapp) return;
    const text = `Hello! I would like to order:\n\n*${item.name}*\nPrice: ${t.currencySymbol}${item.price}\n\nThank you!`;
    window.open(`https://wa.me/${headerInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || chatInput;
    if (!messageText.trim() || isChatLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: messageText };
    setChatMessages(prev => [...prev, userMessage]);
    if (!text) setChatInput('');
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const context = `You are an AI assistant for ${headerInfo.restaurant}. 
      Current Menu Status:
      ${items.map(item => `- ${item.name} (${t.currencySymbol}${item.price}): ${item.description} [Category: ${item.category}]${item.isBestSeller ? ' (Best Seller)' : ''}`).join('\n')}
      
      Your Goal:
      1. Provide helpful recommendations based on the menu above.
      2. Answer questions about ingredients or restaurant details.
      3. Keep responses warm, professional, and concise.
      4. If a user wants to order, guide them to use the WhatsApp button on each dish.
      5. Current language: ${language}. Always respond in ${language}.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          { role: 'user', parts: [{ text: context }] },
          ...chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: messageText }] }
        ],
      });

      const modelMessage: ChatMessage = { role: 'model', text: response.text || 'I am sorry, I could not process that request.' };
      setChatMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: 'I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const bestSellers = useMemo(() => {
    const queryStr = searchQuery.toLowerCase().trim();
    return items.filter(item => 
      item.isBestSeller && 
      (!queryStr || 
       item.name.toLowerCase().includes(queryStr) || 
       item.description.toLowerCase().includes(queryStr) ||
       item.category.toLowerCase().includes(queryStr))
    );
  }, [items, searchQuery]);

  // Group items by category for faster rendering
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    const queryStr = searchQuery.toLowerCase().trim();
    
    items.forEach(item => {
      const matchesQuery = !queryStr || 
        item.name.toLowerCase().includes(queryStr) || 
        item.description.toLowerCase().includes(queryStr) ||
        item.category.toLowerCase().includes(queryStr);

      if (matchesQuery) {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
      }
    });
    return grouped;
  }, [items, searchQuery]);

  if ((!isAuthReady && !isViewOnly) || (isLoading && items.length === 0)) {
    return (
      <div className="min-h-screen bg-menu-bg flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-menu-accent animate-spin" />
        <p className="text-menu-accent font-bold uppercase tracking-[0.3em] text-xs animate-pulse">Loading Menu...</p>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen ${isViewOnly ? 'share-mode' : 'bg-menu-bg text-white'} p-4 md:p-12 selection:bg-menu-accent selection:text-menu-bg ${isNonLatin ? 'font-sans' : ''} relative`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background Decorative Elements */}
      {!isViewOnly && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.07] scale-110 blur-xl"></div>
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[150px]"></div>
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Language Switcher */}
        <div className="flex flex-wrap justify-end mb-8 gap-2">
          {!isViewOnly && (
            <button
              onClick={translateMenuContent}
              disabled={isTranslating}
              className="flex items-center gap-2 px-4 py-1 text-[10px] uppercase tracking-widest font-bold border border-menu-accent text-menu-accent rounded-sm hover:bg-menu-accent hover:text-menu-bg transition-all disabled:opacity-50"
            >
              {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {isTranslating ? t.translating : t.translateMenu}
            </button>
          )}
          {(['en', 'ar', 'bn'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 text-[10px] uppercase tracking-widest font-bold border rounded-sm transition-all ${
                language === lang 
                  ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                  : 'border-white/20 text-white/60 hover:text-white hover:border-white'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div className={`relative group ${!isViewOnly ? 'cursor-pointer' : ''}`} onClick={toggleHeaderEdit}>
            <p className="text-[16px] sm:text-[22px] tracking-[0.4em] uppercase font-black opacity-100 mb-2">
              {headerInfo.restaurant}
            </p>
            <h1 className={`menu-title text-6xl sm:text-8xl md:text-[12rem] flex flex-col ${isNonLatin ? 'font-sans tracking-normal' : ''}`}>
              <span>{headerInfo.title.slice(0, Math.ceil(headerInfo.title.length / 2))}</span>
              <span className="md:-mt-12">{headerInfo.title.slice(Math.ceil(headerInfo.title.length / 2))}</span>
            </h1>
            {!isViewOnly && (
              <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-40 transition-opacity">
                <Plus size={16} className="rotate-45" />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {!isViewOnly && (
              <>
                <button 
                  onClick={() => { setIsAdding(true); setIsAddingCategory(true); setIsEditingHeader(false); setEditingId(null); }}
                  className="flex items-center justify-center gap-2 border border-white text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all rounded-sm"
                >
                  <Plus size={16} /> {t.addCategory}
                </button>
                <button 
                  onClick={toggleForm}
                  className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white border border-white transition-all rounded-sm"
                >
                  {isAdding && !isEditingHeader && !isAddingCategory ? t.cancel : <><Plus size={16} /> {t.addDish}</>}
                </button>
              </>
            )}
            <div className="flex gap-2">
              {!isViewOnly && (
                user ? (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 border border-white text-white px-4 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all rounded-sm"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className="flex items-center justify-center gap-2 border border-white text-white px-4 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all rounded-sm"
                    title="Login"
                  >
                    <LogIn size={16} />
                  </button>
                )
              )}
              <button 
                onClick={copyShareLink}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-bold uppercase tracking-widest text-xs transition-all rounded-sm ${isViewOnly ? 'bg-white text-black' : 'border border-white text-white hover:bg-white hover:text-black'}`}
              >
                {t.shareMenu}
              </button>
              {!isViewOnly && (
                <button 
                  onClick={openShareLink}
                  className="flex items-center justify-center gap-2 border border-white text-white px-4 py-3 font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all rounded-sm"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} />
                </button>
              )}
              <button 
                onClick={shareOnWhatsApp}
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all rounded-sm"
                title={t.shareOnWhatsApp}
              >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">{t.shareWhatsApp}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto w-full px-4 sm:px-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors" size={20} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-14 pr-14 text-white text-lg focus:outline-none focus:border-white focus:bg-white/10 transition-all shadow-2xl placeholder:text-white/30"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Quick Nav */}
        {categories.length > 0 && (
          <nav className="sticky top-0 z-40 bg-menu-bg/90 backdrop-blur-md border-b border-menu-accent/10 mb-12 -mx-4 px-4 py-4 overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex gap-4 sm:gap-8 min-w-max max-w-7xl mx-auto px-4">
              {categories.map(cat => (
                <a 
                  key={cat.id} 
                  href={`#${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-[16px] sm:text-[22px] uppercase tracking-[0.3em] font-black text-white/50 hover:text-white hover:border-b-4 hover:border-white transition-all whitespace-nowrap pb-2"
                >
                  {cat.name}
                </a>
              ))}
            </div>
          </nav>
        )}

        {/* Featured Section */}
        {bestSellers.length > 0 && (
          <section className="mb-20">
              <div className="flex items-center gap-4 mb-10">
                <Sparkles className="text-white" size={20} />
                <h2 className="text-xl font-bold uppercase tracking-[0.2em]">{t.bestSellerBadge}</h2>
                <div className="flex-1 h-[1px] bg-white/20"></div>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bestSellers.map(item => (
                <motion.div 
                  key={item.id}
                  layoutId={`featured-${item.id}`}
                  className="group relative bg-[#111] rounded-sm overflow-hidden border border-white/10 hover:border-white transition-all duration-500 shadow-xl"
                >
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img 
                      src={item.image || 'https://picsum.photos/seed/food/800/600'} 
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-zoom-in"
                      onClick={() => setZoomedImage(item.image)}
                    />
                    {!isViewOnly && user && item.image && (
                      <button 
                        onClick={() => {
                          const updatedItem = { ...item, image: '' };
                          setDoc(doc(db, 'items', item.id), updatedItem);
                        }}
                        className="absolute top-4 right-4 bg-red-500/80 text-white p-2 rounded-full hover:bg-red-500 transition-colors shadow-lg z-10"
                        title={t.removeImage}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <span className="text-menu-accent font-bold">{t.currencySymbol}{item.price}</span>
                    </div>
                    <p className="text-white/60 text-sm line-clamp-2 mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      {headerInfo.whatsapp && (
                        <button 
                          onClick={() => orderItemOnWhatsApp(item)}
                          className="flex-1 py-2 border border-menu-accent/30 text-menu-accent text-[10px] uppercase tracking-widest font-bold hover:bg-menu-accent hover:text-menu-bg transition-all"
                        >
                          {t.order}
                        </button>
                      )}
                      {!isViewOnly && user && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => editItem(item)}
                            className="p-2 border border-menu-accent/30 text-menu-accent hover:bg-menu-accent hover:text-menu-bg transition-all"
                            title={t.edit}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => setConfirmDelete({ id: item.id, type: 'item', name: item.name })}
                            className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            title={t.delete}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Share Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-menu-accent text-menu-bg px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl z-50 whitespace-nowrap"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add/Edit Item Form */}
        <AnimatePresence>
          {isAdding && !isViewOnly && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16 bg-black/5 p-8 rounded-sm border border-black/10"
            >
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-8 opacity-40">
                {isEditingHeader ? t.editingHeader : isAddingCategory ? (editingCategoryIndex !== null ? t.editCategory : t.addNewCategory) : editingId ? t.editingDish : t.addNewDish}
              </h2>

              {isEditingHeader ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.restaurantName}</label>
                    <input 
                      type="text" 
                      value={headerInfo.restaurant}
                      onChange={(e) => setHeaderInfo({ ...headerInfo, restaurant: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 p-3 focus:outline-none focus:border-white transition-colors text-white font-medium shadow-xl placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.menuTitle} (e.g. MENU)</label>
                    <input 
                      type="text" 
                      value={headerInfo.title}
                      onChange={(e) => setHeaderInfo({ ...headerInfo, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 p-3 focus:outline-none focus:border-white transition-colors text-white font-medium shadow-xl placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.whatsappNumber}</label>
                    <input 
                      type="text" 
                      value={headerInfo.whatsapp}
                      onChange={(e) => setHeaderInfo({ ...headerInfo, whatsapp: e.target.value })}
                      placeholder="+1234567890"
                      className="w-full bg-white/5 border border-white/20 p-3 shadow-xl focus:outline-none focus:border-white transition-colors text-white font-medium placeholder:text-white/20"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button 
                      onClick={saveHeader}
                      disabled={!headerInfo.restaurant || !headerInfo.title || isSaving}
                      className="bg-menu-accent text-menu-bg w-full py-4 font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      {isSaving ? '...' : t.save}
                    </button>
                  </div>
                </div>
              ) : isAddingCategory ? (
                <div className="max-w-md space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.category}</label>
                    <input 
                      type="text" 
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder={t.placeholderCat}
                      className="w-full bg-white/5 border border-white/20 p-3 shadow-xl focus:outline-none focus:border-white transition-colors text-white font-medium placeholder:text-white/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.description}</label>
                    <textarea 
                      value={newCategory.description || ''}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder={t.placeholderDesc}
                      rows={2}
                      className="w-full bg-white/5 border border-white/20 p-3 shadow-xl focus:outline-none focus:border-white transition-colors resize-none text-white font-medium placeholder:text-white/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.dishImage}</label>
                    <div className="flex gap-4 items-start">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 border-2 border-dashed border-black/20 p-8 text-center cursor-pointer hover:border-menu-accent transition-all group relative overflow-hidden min-h-[120px] flex flex-col items-center justify-center"
                      >
                        {newCategory.image ? (
                          <img src={newCategory.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-20 transition-opacity" />
                        ) : null}
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <Upload className="text-menu-accent" size={24} />
                          <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">{t.uploadImage}</p>
                        </div>
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleCategoryImageUpload}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                      {newCategory.image && (
                        <button 
                          onClick={() => setNewCategory({ ...newCategory, image: '' })}
                          className="bg-red-500/20 text-red-500 p-3 hover:bg-red-500 hover:text-white transition-all rounded-sm"
                          title={t.removeImage}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={addCategory}
                      disabled={!newCategory.name || isSaving}
                      className="flex-1 bg-menu-accent text-menu-bg py-4 font-bold uppercase tracking-widest text-xs disabled:opacity-50 hover:bg-white transition-colors rounded-sm"
                    >
                      {isSaving ? '...' : (editingCategoryIndex !== null ? t.save : t.addCategory)}
                    </button>
                    {editingCategoryIndex !== null && (
                      <button 
                        onClick={() => setConfirmDelete({ id: categories[editingCategoryIndex].id, type: 'category', name: categories[editingCategoryIndex].name })}
                        disabled={isSaving}
                        className="px-6 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all rounded-sm"
                        title={t.delete}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.category}</label>
                      <select 
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        className="w-full bg-white border border-black/20 p-3 shadow-inner focus:outline-none focus:border-menu-accent transition-colors mb-4 appearance-none text-menu-accent font-medium"
                      >
                        <option value="" disabled>{t.selectCategory}</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.dishName}</label>
                      <input 
                        type="text" 
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder={t.placeholderDish}
                        className="w-full bg-white/5 border border-white/20 p-3 shadow-xl focus:outline-none focus:border-white transition-colors text-white font-medium placeholder:text-white/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.price} ({t.currencySymbol})</label>
                          <input 
                            type="text" 
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            placeholder="14.00"
                            className="w-full bg-white/5 border border-white/20 p-3 shadow-xl focus:outline-none focus:border-white transition-colors text-white font-medium placeholder:text-white/20"
                          />
                      </div>
                      <div className="flex items-end pb-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div 
                            onClick={() => setNewItem({ ...newItem, isBestSeller: !newItem.isBestSeller })}
                            className={`w-6 h-6 border border-white/30 flex items-center justify-center transition-colors ${newItem.isBestSeller ? 'bg-white border-white' : 'group-hover:border-white'}`}
                          >
                            {newItem.isBestSeller && <Check size={14} className="text-menu-bg" />}
                          </div>
                          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">{t.bestSeller}</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.description}</label>
                      <textarea 
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        placeholder={t.placeholderDesc}
                        rows={3}
                        className="w-full bg-white/5 border border-white/20 p-3 shadow-xl focus:outline-none focus:border-white transition-colors resize-none text-white font-medium placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 opacity-60">{t.dishImage}</label>
                    <div className="flex-1 relative group">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-full min-h-[200px] border-2 border-dashed border-black/20 hover:border-menu-accent transition-colors cursor-pointer flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
                      >
                        {newItem.image ? (
                          <>
                            <img src={newItem.image} alt="Preview" className="w-full h-full object-cover rounded-sm" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Upload className="text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="mb-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <p className="text-xs opacity-60">{t.uploadImage}</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleImageUpload} 
                          className="hidden" 
                          accept="image/*"
                        />
                      </div>
                      {newItem.image && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setNewItem({ ...newItem, image: '' }); }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                          title={t.removeImage}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={addItem}
                      disabled={!newItem.name || !newItem.price || !newItem.category || isSaving}
                      className="mt-4 bg-menu-accent text-menu-bg w-full py-4 font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                    >
                      {isSaving ? '...' : (editingId ? t.update : t.addDish)}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

          {/* Menu Grid Grouped by Category */}
          <div className="space-y-24">
            {categories.length === 0 && !isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center opacity-40 border border-dashed border-black/10">
                <UtensilsCrossed size={48} className="mb-4" />
                <p className="uppercase tracking-widest text-xs font-bold">{t.emptyMenu}</p>
                {!isViewOnly && user && (
                  <button 
                    onClick={() => { setIsAdding(true); setIsAddingCategory(true); }}
                    className="mt-4 text-[10px] underline underline-offset-4 hover:text-white transition-colors"
                  >
                    {t.addNewCategory}
                  </button>
                )}
              </div>
            ) : (
              <>
                {categories.map((category, catIndex) => {
                  const catItems = itemsByCategory[category.name] || [];
                  
                  // Only hide empty categories for customers (view-only mode)
                  if (catItems.length === 0 && (isViewOnly || !user)) return null;

                  return (
                    <div key={category.id} id={category.name.toLowerCase().replace(/\s+/g, '-')} className="space-y-12 scroll-mt-32">
                <div className="space-y-6">
                  {category.image && (
                    <div className="relative w-full h-48 md:h-64 rounded-sm overflow-hidden border border-black/10 group/img shadow-xl">
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        loading="lazy" 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 cursor-zoom-in" 
                        onClick={() => setZoomedImage(category.image || null)}
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black/40 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full border border-white/20">
                          {language === 'ar' ? 'تذكير' : language === 'bn' ? 'জুম করুন' : 'Click to Zoom'}
                        </div>
                      </div>
                      {!isViewOnly && user && (
                        <button 
                          onClick={() => {
                            const updatedCat = { ...category, image: '' };
                            setDoc(doc(db, 'categories', category.id), updatedCat);
                          }}
                          className="absolute top-4 right-4 bg-red-500/80 text-white p-2 rounded-full hover:bg-red-500 transition-colors shadow-lg"
                          title={t.removeImage}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4 group/cat">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="space-y-1">
                        <h2 className={`text-[32px] font-bold border-2 border-white bg-black text-white px-6 py-3 rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] inline-block ${isNonLatin ? 'font-sans' : 'font-serif'} tracking-tight cursor-default transition-transform active:scale-95 uppercase`}>{category.name}</h2>
                        {category.description && (
                          <p className="text-xs opacity-40 uppercase tracking-widest font-medium mt-2">{category.description}</p>
                        )}
                      </div>
                      <div className="h-[1px] flex-1 bg-white/20"></div>
                    </div>
                    {!isViewOnly && user && (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => moveCategory(catIndex, 'up')}
                          disabled={catIndex === 0}
                          className="p-2 text-menu-accent hover:bg-menu-accent/10 rounded-full disabled:opacity-20"
                          title={t.moveUp}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button 
                          onClick={() => moveCategory(catIndex, 'down')}
                          disabled={catIndex === categories.length - 1}
                          className="p-2 text-menu-accent hover:bg-menu-accent/10 rounded-full disabled:opacity-20"
                          title={t.moveDown}
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button 
                          onClick={() => editCategory(catIndex)}
                          className="p-2 text-menu-accent hover:bg-menu-accent/10 rounded-full"
                          title={t.editCategoryName}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => setConfirmDelete({ id: category.id, type: 'category', name: category.name })}
                          className="text-red-400 p-2 hover:bg-red-400/10 rounded-full"
                          title={t.removeCategory}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
                  {catItems.map((item, index) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={item.id} 
                      className="relative group"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-white/5 flex items-center justify-center cursor-zoom-in mb-6 group/img shadow-lg" onClick={() => item.image && setZoomedImage(item.image)}>
                        {item.image ? (
                          <>
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              loading="lazy"
                              className="w-full h-full object-cover grayscale-[0.2] group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-1000"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                              <div className="bg-black/40 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full border border-white/20">
                                {language === 'ar' ? 'تذكير' : language === 'bn' ? 'জুম করুন' : 'Click to Zoom'}
                              </div>
                            </div>
                          </>
                        ) : (
                          <UtensilsCrossed size={48} className="opacity-20 text-white" />
                        )}
                        {item.isBestSeller && (
                          <div className="best-seller-badge">{t.bestSellerBadge}</div>
                        )}
                        {isViewOnly && headerInfo.whatsapp && (
                          <button 
                            onClick={() => orderItemOnWhatsApp(item)}
                            className="absolute bottom-4 right-4 bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2"
                          >
                            <MessageCircle size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest pr-1">{t.order}</span>
                          </button>
                        )}
                      </div>

                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className="menu-item-number shrink-0">{index + 1}</div>
                          <div>
                            <h3 className={`text-2xl mb-1 ${isNonLatin ? 'font-sans font-bold' : 'font-serif'}`}>{item.name}</h3>
                            <p className="text-[11px] opacity-60 leading-relaxed max-w-[280px]">{item.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xl ${isNonLatin ? 'font-sans font-bold' : 'font-serif'}`}>{t.currencySymbol}{item.price}</span>
                          {!isViewOnly && user && (
                            <div className="flex gap-2 justify-end mt-2">
                              <button 
                                onClick={() => editItem(item)}
                                className="text-menu-accent p-1 hover:bg-menu-accent/10 rounded-full"
                                title={t.edit}
                              >
                                <Plus size={14} className="rotate-45" />
                              </button>
                              <button 
                                onClick={() => setConfirmDelete({ id: item.id, type: 'item', name: item.name })}
                                className="text-red-400 p-1 hover:bg-red-400/10 rounded-full"
                                title={t.delete}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Uncategorized Items Section */}
          {itemsByCategory[''] && itemsByCategory[''].length > 0 && (
            <div key="uncategorized" className="space-y-12 scroll-mt-32 pt-12 border-t border-white/10">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 group/cat">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="space-y-1">
                      <h2 className={`text-[32px] font-bold border-2 border-white bg-black text-white px-6 py-3 rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] inline-block ${isNonLatin ? 'font-sans' : 'font-serif'} tracking-tight cursor-default transition-transform active:scale-95 uppercase`}>
                        {language === 'ar' ? 'أطباق أخرى' : language === 'bn' ? 'অন্যান্য খাবার' : 'Other Dishes'}
                      </h2>
                    </div>
                    <div className="h-[1px] flex-1 bg-white/10"></div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
                {itemsByCategory[''].map((item, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={item.id} 
                    className="relative group"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-white/5 flex items-center justify-center cursor-zoom-in mb-6 group/img shadow-lg" onClick={() => item.image && setZoomedImage(item.image)}>
                      {item.image ? (
                        <>
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            loading="lazy"
                            className="w-full h-full object-cover grayscale-[0.2] group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-1000"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-black/40 backdrop-blur-sm text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full border border-white/20">
                              {language === 'ar' ? 'تذكير' : language === 'bn' ? 'জুম করুন' : 'Click to Zoom'}
                            </div>
                          </div>
                        </>
                      ) : (
                        <UtensilsCrossed size={48} className="opacity-20 text-white" />
                      )}
                      {item.isBestSeller && (
                        <div className="best-seller-badge">{t.bestSellerBadge}</div>
                      )}
                    </div>

                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="menu-item-number shrink-0">{index + 1}</div>
                        <div>
                          <h3 className={`text-2xl mb-1 ${isNonLatin ? 'font-sans font-bold' : 'font-serif'}`}>{item.name}</h3>
                          <p className="text-[11px] opacity-60 leading-relaxed max-w-[280px]">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl ${isNonLatin ? 'font-sans font-bold' : 'font-serif'}`}>{t.currencySymbol}{item.price}</span>
                        {!isViewOnly && user && (
                          <div className="flex gap-2 justify-end mt-2">
                            <button 
                              onClick={() => editItem(item)}
                              className="text-menu-accent p-1 hover:bg-menu-accent/10 rounded-full"
                              title={t.edit}
                            >
                              <Plus size={14} className="rotate-45" />
                            </button>
                            <button 
                              onClick={() => setConfirmDelete({ id: item.id, type: 'item', name: item.name })}
                              className="text-red-400 p-1 hover:bg-red-400/10 rounded-full"
                              title={t.delete}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>

        {/* Footer */}
        <footer className="mt-32 pt-8 border-t border-white/10 flex justify-between items-center opacity-40">
          <p className="text-[10px] uppercase tracking-widest font-bold">© 2026 {headerInfo.restaurant}</p>
          <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold">
            <span>{t.fineDining}</span>
            <span>{t.est}</span>
          </div>
        </footer>
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomedImage}
                alt="Zoomed"
                className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 md:-top-12 md:-right-12 text-red-500 hover:text-white transition-colors p-3 bg-black/50 rounded-full backdrop-blur-md border border-white/20"
              >
                <X size={28} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Widgets */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-3 sm:gap-4">
        {/* Delete Confirmation Modal (Fixed positioning) */}
        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border border-red-500/50 p-6 rounded-sm shadow-2xl max-w-[280px] sm:max-w-xs text-center mb-4"
            >
              <p className="text-[10px] uppercase tracking-widest font-bold mb-4">
                {confirmDelete.type === 'item' 
                  ? `Delete "${confirmDelete.name || 'this dish'}"?` 
                  : `Delete "${confirmDelete.name || confirmDelete.id}" category?`}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmDelete(null)}
                  disabled={isSaving}
                  className="flex-1 py-2 text-[9px] uppercase tracking-widest font-bold border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => confirmDelete.type === 'item' ? removeItem(confirmDelete.id) : removeCategory(confirmDelete.id)}
                  disabled={isSaving}
                  className="flex-1 py-2 text-[9px] uppercase tracking-widest font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? '...' : t.delete}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Chat Window */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[calc(100vh-10rem)] bg-white border border-black/10 rounded-sm shadow-2xl flex flex-col overflow-hidden mb-4"
            >
              <div className="p-4 border-b border-black/10 bg-black flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-menu-accent flex items-center justify-center text-menu-bg">
                    <Bot size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-white">{t.aiAssistant}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-[8px] uppercase tracking-widest opacity-60 text-white">{t.online}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-red-500 hover:text-white transition-colors p-1 bg-red-500/10 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {chatMessages.length === 0 && !isChatLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-2">
                    <Sparkles size={32} />
                    <p className="text-[10px] uppercase tracking-widest font-bold">{t.chatWelcome}</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-sm text-xs leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-white text-black font-bold shadow-xl border border-white/20' 
                        : 'bg-white/5 text-white border border-white/10'
                    }`}>
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-black/5 p-3 rounded-sm border border-black/10">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-menu-accent rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-menu-accent rounded-full animate-bounce delay-75"></div>
                        <div className="w-1 h-1 bg-menu-accent rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {!isChatLoading && chatMessages.length === 0 && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                  {[t.suggestBestSeller, t.suggestVegetarian, t.suggestPrice].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSendMessage(suggestion)}
                      className="whitespace-nowrap bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest px-3 py-1.5 hover:border-menu-accent transition-colors rounded-full text-white"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-4 border-t border-black/10 bg-black/5">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t.chatPlaceholder}
                    className="flex-1 bg-white border border-black/10 p-2 text-xs focus:outline-none focus:border-menu-accent transition-colors text-black"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || isChatLoading}
                    className="bg-menu-accent text-menu-bg p-2 rounded-sm disabled:opacity-50 hover:bg-white transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-menu-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-black transition-all group"
            title="Back to Top"
          >
            <ChevronUp size={24} className="group-hover:-translate-y-1 transition-transform" />
          </button>

          {headerInfo.whatsapp && (
            <button
              onClick={shareOnWhatsApp}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
              title={t.shareWhatsApp}
            >
              <MessageCircle size={24} />
            </button>
          )}

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all relative ${
                isChatOpen ? 'bg-menu-accent text-white' : 'bg-menu-accent text-white shadow-md hover:bg-black'
              }`}
            >
            {isChatOpen ? <X size={24} /> : <Bot size={24} />}
            {!isChatOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-menu-accent rounded-full border-2 border-menu-bg animate-bounce"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
