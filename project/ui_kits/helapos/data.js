/* HelaPOS sample data — restaurant menu, order metrics for the kit. */
window.HELA_DATA = (function () {
  const categories = [
    { id: "starters",  name: "Starters",  icon: "🥗" },
    { id: "breakfast", name: "Breakfast", icon: "🍳" },
    { id: "lunch",     name: "Lunch",     icon: "🍜" },
    { id: "supper",    name: "Supper",    icon: "🍲" },
    { id: "deserts",   name: "Deserts",   icon: "🍰" },
    { id: "beverages", name: "Beverages", icon: "🧋" },
  ];

  // tile = soft background behind the dish emoji (photo placeholder)
  const products = [
    // Lunch (default tab, matches reference)
    { id: 1,  name: "Schezwan Egg Noodles",   cat: "lunch", price: 24.00, icon: "🍜", tile: "#FDE8D8" },
    { id: 2,  name: "Stir Egg Fry Udon",      cat: "lunch", price: 24.00, icon: "🍳", tile: "#FFF1C9" },
    { id: 3,  name: "Thai Style Fried Noodles",cat: "lunch", price: 24.00, icon: "🍝", tile: "#E5F0DA" },
    { id: 4,  name: "Chinese Prawn Spaghetti",cat: "lunch", price: 24.00, icon: "🍤", tile: "#E3ECF7" },
    { id: 5,  name: "Japanese Soba Noodles",  cat: "lunch", price: 24.00, icon: "🥢", tile: "#EDE6F7" },
    { id: 6,  name: "Chinese Prawn Spaghetti",cat: "lunch", price: 24.00, icon: "🍝", tile: "#FBE2E2" },
    { id: 7,  name: "Chilli Garlic Thai",     cat: "lunch", price: 24.00, icon: "🌶️", tile: "#FCE3D6" },
    { id: 8,  name: "Schezwan Egg Noodles",   cat: "lunch", price: 24.00, icon: "🍜", tile: "#FDE8D8" },
    { id: 9,  name: "Thai Style Fried Rice",  cat: "lunch", price: 22.00, icon: "🍚", tile: "#E5F0DA" },
    { id: 10, name: "Stir Egg Fry Udon",      cat: "lunch", price: 26.00, icon: "🍳", tile: "#FFF1C9" },
    { id: 11, name: "Chilli Garlic Thai",     cat: "lunch", price: 24.00, icon: "🌶️", tile: "#FCE3D6" },
    { id: 12, name: "Chinese Prawn Spaghetti",cat: "lunch", price: 28.00, icon: "🍤", tile: "#E3ECF7" },
    // Starters
    { id: 13, name: "Spring Rolls",           cat: "starters", price: 12.00, icon: "🥟", tile: "#FFF1C9" },
    { id: 14, name: "Garden Salad",           cat: "starters", price: 14.00, icon: "🥗", tile: "#E5F0DA" },
    { id: 15, name: "Chicken Wings",          cat: "starters", price: 18.00, icon: "🍗", tile: "#FCE3D6" },
    { id: 16, name: "Prawn Tempura",          cat: "starters", price: 20.00, icon: "🍤", tile: "#E3ECF7" },
    // Breakfast
    { id: 17, name: "Egg Benedict",           cat: "breakfast", price: 16.00, icon: "🍳", tile: "#FFF1C9" },
    { id: 18, name: "Pancake Stack",          cat: "breakfast", price: 13.00, icon: "🥞", tile: "#FDE8D8" },
    { id: 19, name: "Avocado Toast",          cat: "breakfast", price: 15.00, icon: "🥑", tile: "#E5F0DA" },
    { id: 20, name: "Fruit Bowl",             cat: "breakfast", price: 11.00, icon: "🍓", tile: "#FBE2E2" },
    // Supper
    { id: 21, name: "Spicy Shrimp Soup",      cat: "supper", price: 40.00, icon: "🍲", tile: "#FCE3D6" },
    { id: 22, name: "Fried Basil Chicken",    cat: "supper", price: 35.00, icon: "🍗", tile: "#FFF1C9" },
    { id: 23, name: "Beef Ramen",             cat: "supper", price: 32.00, icon: "🍜", tile: "#FDE8D8" },
    { id: 24, name: "Grilled Salmon",         cat: "supper", price: 45.00, icon: "🐟", tile: "#E3ECF7" },
    // Deserts
    { id: 25, name: "Cheesecake Slice",       cat: "deserts", price: 9.00, icon: "🍰", tile: "#FBE2E2" },
    { id: 26, name: "Chocolate Lava",         cat: "deserts", price: 10.00, icon: "🍫", tile: "#FDE8D8" },
    { id: 27, name: "Mango Sticky Rice",      cat: "deserts", price: 8.00, icon: "🥭", tile: "#FFF1C9" },
    { id: 28, name: "Ice Cream Sundae",       cat: "deserts", price: 7.50, icon: "🍨", tile: "#EDE6F7" },
    // Beverages
    { id: 29, name: "Thai Iced Tea",          cat: "beverages", price: 6.00, icon: "🧋", tile: "#FDE8D8" },
    { id: 30, name: "Fresh Lemonade",         cat: "beverages", price: 5.00, icon: "🍋", tile: "#FFF1C9" },
    { id: 31, name: "Cold Brew Coffee",       cat: "beverages", price: 5.50, icon: "🧊", tile: "#E3ECF7" },
    { id: 32, name: "Mango Smoothie",         cat: "beverages", price: 6.50, icon: "🥭", tile: "#FBE2E2" },
  ];

  const tables = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"];

  const recentTx = [
    { no: "ORD-00482", time: "10:24:11", total: 245.00 },
    { no: "ORD-00481", time: "10:19:02", total: 88.50 },
    { no: "ORD-00480", time: "10:11:47", total: 152.00 },
    { no: "ORD-00479", time: "10:03:22", total: 63.45 },
    { no: "ORD-00478", time: "09:58:10", total: 131.20 },
  ];

  const weekSales = [
    { day: "Mon", v: 1240 }, { day: "Tue", v: 1680 }, { day: "Wed", v: 1410 },
    { day: "Thu", v: 1920 }, { day: "Fri", v: 2380 }, { day: "Sat", v: 2710 },
    { day: "Sun", v: 1990 },
  ];

  const TAX_RATE = 0.08;
  const fmt = (n) => "$" + n.toFixed(2);

  return { categories, products, tables, recentTx, weekSales, TAX_RATE, fmt };
})();
