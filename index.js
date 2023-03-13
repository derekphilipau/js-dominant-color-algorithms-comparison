import { generateHtml } from "./src/html/generateHtml.js";

const images = [
  {
    filename: "2018.1_DM.13156.jpg",
    title: "Lot 043017 (Multiflora, Radiant Blue)",
    artist: "Donald Moffett",
    url: "https://bkm-next-search.vercel.app/collection/object/224276",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/2018.1_DM.13156.jpg",
  },
  {
    filename: "2019.11_view01_SC.jpg",
    title: "... three kings weep ...",
    artist: "Ebony G. Patterson",
    url: "https://bkm-next-search.vercel.app/collection/object/224733",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/2019.11_view01_SC.jpg",
  },
  {
    filename: "2021.45_PS11 (1).jpg",
    title: "The Arm Wrestle of Chip & Spike; aka: Star-Makers",
    artist: "Oscar yi Hou",
    url: "https://bkm-next-search.vercel.app/collection/object/224994",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/2021.45_PS11.jpg",
  },
  {
    filename: "CUR.2014.37_Nicola_Vassell_photograph.jpg",
    title: "P31:10",
    artist: "Rashaad Newsome",
    url: "https://bkm-next-search.vercel.app/collection/object/216203",
    imageUrl: "",
  },
  {
    filename: "CUR.2015.72.2_Magnin-A_photograph.jpg",
    title: "El Moro",
    artist: "Omar Victor Diop",
    url: "https://bkm-next-search.vercel.app/collection/object/220184",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/CUR.2015.72.2_Magnin-A_photograph.jpg",
  },
  {
    filename: "TL2020.7_PS11.jpg",
    title: "Triumph of the Vanities II",
    artist: "Cecily Brown",
    url: "https://bkm-next-search.vercel.app/collection/object/224799",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/TL2020.7_PS11.jpg",
  },
  {
    filename: "TL2021.66_PS11.jpg",
    title: "Disease Thrower #18",
    artist: "Guadalupe Maravilla",
    url: "https://bkm-next-search.vercel.app/collection/object/225053",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/TL2021.66_PS11.jpg",
  },
  {
    filename: "CUR.2017.25.1_KrisGraves_photograph.jpg",
    title: "Tarabu and Mamie Kirkland, Los Angeles, California",
    artist: "Kris Graves",
    url: "https://bkm-next-search.vercel.app/collection/object/224165",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/CUR.2017.25.1_KrisGraves_photograph.jpg",
  },
  {
    filename: "1999.13.1_PS4.jpg",
    title: "Untitled, Coney Island Series",
    artist: "Lynn Hyman Butler",
    url: "https://bkm-next-search.vercel.app/collection/object/2501",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/1999.13.1_PS4.jpg",
  },
  {
    filename: "CUR.2003.37_Yossi_Milo_Gallery_photograph.jpg",
    title: "Spring",
    artist: "Loretta Lux",
    url: "https://bkm-next-search.vercel.app/collection/object/165719",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/CUR.2003.37_Yossi_Milo_Gallery_photograph.jpg",
  },
  {
    filename: "CUR.2012.73a-b_Lehman_Maupin_photo_LM15960.jpg",
    title: "Monet's Salle a Manger Jaune",
    artist: "Mickalene Thomas",
    url: "https://bkm-next-search.vercel.app/collection/object/209424",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/CUR.2012.73a-b_Lehman_Maupin_photo_LM15960.jpg",
  },
];

const testimages = [
  {
    filename: "2021.45_PS11 (1).jpg",
    title: "The Arm Wrestle of Chip & Spike; aka: Star-Makers",
    artist: "Oscar yi Hou",
    url: "https://bkm-next-search.vercel.app/collection/object/224994",
    imageUrl:
      "https://d1lfxha3ugu3d4.cloudfront.net/images/opencollection/objects/size4/2021.45_PS11.jpg",
  },

]

generateHtml(images, 8);
