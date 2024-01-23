import slugify from "slugify";

export const PRODUCT_CATEGORIES = [
  {
    label: "UI Kits",
    value: slugify("UI Kits", { lower: true }),
    featured: [
      {
        name: "Editor Picks",
        href: "#",
        imageSrc: "/nav/ui-kits/mixed.jpg",
      },
      {
        name: "New Arrivals",
        href: "#",
        imageSrc: "/nav/ui-kits/blue.jpg",
      },
      {
        name: "Bestsellers",
        href: "#",
        imageSrc: "/nav/ui-kits/purple.jpg",
      },
    ],
  },
  {
    label: "Icons",
    value: slugify("Icons", { lower: true }),
    featured: [
      {
        name: "Favourite Icon Picks",
        href: "#",
        imageSrc: "/nav/icons/picks.jpg",
      },
      {
        name: "New Arrivals",
        href: "#",
        imageSrc: "/nav/icons/new.jpg",
      },
      {
        name: "Bestselling Icons",
        href: "#",
        imageSrc: "/nav/icons/bestsellers.jpg",
      },
    ],
  },
];
