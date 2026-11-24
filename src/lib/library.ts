import { doc, setDoc } from "firebase/firestore";
import { firebaseServices } from "./firebase";
import type { Book } from "./types";
export async function updateLibrary(
  uid: string,
  book: Book,
  change: { saved?: boolean; finished?: boolean },
) {
  await setDoc(
    doc(firebaseServices().db, "users", uid, "library", book.id),
    { book, ...change },
    { merge: true },
  );
}
