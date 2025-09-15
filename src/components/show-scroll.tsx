// ;

// import { ChevronRight } from "lucide-react";
// import { ShowCard } from "./show-card";

// const shows = [
//   {
//     title: "Savaşın Efsaneleri",
//     image: "https://kzmo8y67pmcajgnwxgs9.lite.vusercontent.net/placeholder.svg",
//     href: "/savas-efsaneleri",
//   },
//   {
//     title: "Ayasofya",
//     image:
//       "https://kzmo8y67pmcajgnwxgs9.lite.vusercontent.net/placeholder.svg?height=300&width=200",
//     href: "/ayasofya",
//   },
//   {
//     title: "Dünya Tarihinin Dönüm Noktaları",
//     image:
//       "https://kzmo8y67pmcajgnwxgs9.lite.vusercontent.net/placeholder.svg?height=300&width=200",
//     href: "/dunya-tarihi",
//   },
//   {
//     title: "Savaşın Dahileri",
//     image:
//       "https://kzmo8y67pmcajgnwxgs9.lite.vusercontent.net/placeholder.svg?height=300&width=200",
//     href: "/savas-dahileri",
//   },
//   {
//     title: "Tarihin Efsaneleri",
//     image:
//       "https://kzmo8y67pmcajgnwxgs9.lite.vusercontent.net/placeholder.svg?height=300&width=200",
//     href: "/tarih-efsaneleri",
//   },
//   {
//     title: "Muhayyelat",
//     image:
//       "https://kzmo8y67pmcajgnwxgs9.lite.vusercontent.net/placeholder.svg?height=300&width=200",
//     href: "/muhayyelat",
//   },
// ];

// export function ShowScroll() {
//   return (
//     <section className="py-8">
//       <div className="container px-4 md:px-6">
//         <h2 className="text-2xl font-bold mb-6">Zamanda Yolculuk</h2>
//         <div className="relative">
//           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
//             {shows.map((show) => (
//               <ShowCard key={show.href} show={show} />
//             ))}
//           </div>
//           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-full bg-gradient-to-l from-black to-transparent pointer-events-none flex items-center justify-end">
//             <ChevronRight className="w-8 h-8 text-white/50" />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
