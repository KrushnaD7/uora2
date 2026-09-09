// A journal's peer-review PROCESS is a platform-wide policy (double-blind
// review, the same for every journal) rather than per-journal data, so
// there's nothing distinct to show here yet -- send visitors to the one
// canonical page instead of duplicating it. If that ever needs to become
// journal-specific, this is the file to replace with real per-journal
// content (mirroring guidelines/ethics above, which already read from
// journal.settings).
import { Navigate } from "react-router-dom";

export default function JournalPeerReviewPage() {
  return <Navigate to="/peer-review" replace />;
}
