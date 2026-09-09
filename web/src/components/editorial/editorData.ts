import { Editor } from "./types";

export const editors: Editor[] = [
  {
    id: 1,
    role: "Editor-in-Chief",
    name: "Prof. Pawan D. Somavanshi",
    designation: "Ph.D. Mechanical",
    affiliation:
      "Editor-in-Chief at Uora Publications and Uora Institute",
    emails: [
      "Pawan.somavanshi@uorapublications.com",
      "Editor@uorapublications.com",
    ],
    phone: "+91 90964 99989",
    image: "/images/editor-in-chief.jpg",
    remit:
      "Sets editorial policy, appoints reviewers and signs off every final decision.",
  },
  {
    id: 2,
    role: "Managing Editor",
    name: "Dr. Swapnil N. Dhole",
    designation: "Ph.D. Mechanical",
    affiliation:
      "Managing Editor at Uora Publications and Uora Institute",
    emails: ["Swapnil.dhole@uorapublications.com", "Contact@uorapublications.com"],
    phone: "+91 89832 45607",
    image: "/images/managing-editor.jpg",
    remit:
      "Runs the review workflow end to end and keeps authors informed at every stage.",
  },
];
