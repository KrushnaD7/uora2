import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { PageSpinner } from "@/components/ui/PageLoading";
import ScrollToTop from "@/lib/ScrollToTop";

// Role shells. The ported layouts still take `children`, so each is adapted to
// a nested route by feeding it an <Outlet /> -- their markup is untouched.
import AdminLayout from "@/pages/_layouts/admin";
import AuthorLayout from "@/pages/_layouts/author";
import EditorLayout from "@/pages/_layouts/editor";
import ReviewerLayout from "@/pages/_layouts/reviewer";

const AdminLayoutRoute = () => (<AdminLayout><Outlet /></AdminLayout>);
const AuthorLayoutRoute = () => (<AuthorLayout><Outlet /></AuthorLayout>);
const EditorLayoutRoute = () => (<EditorLayout><Outlet /></EditorLayout>);
const ReviewerLayoutRoute = () => (<ReviewerLayout><Outlet /></ReviewerLayout>);

// Every page is code-split, so a visitor downloads only the route they open.
const Home = lazy(() => import("@/pages/page"));
const ApplyPage = lazy(() => import("@/pages/apply/page"));
const ArchivesPage = lazy(() => import("@/pages/archives/page"));
const ArticlesIdPage = lazy(() => import("@/pages/articles/[id]/page"));
const EthicsPage = lazy(() => import("@/pages/ethics/page"));
const GalleryPage = lazy(() => import("@/pages/gallery/page"));
const GuidelinesPage = lazy(() => import("@/pages/guidelines/page"));
const JournalsPage = lazy(() => import("@/pages/journals/page"));
const JournalsSlugPage = lazy(() => import("@/pages/journals/[slug]/page"));
const JournalsSlugArchivesPage = lazy(() => import("@/pages/journals/[slug]/archives/page"));
const JournalsSlugEthicsPage = lazy(() => import("@/pages/journals/[slug]/ethics/page"));
const JournalsSlugGuidelinesPage = lazy(() => import("@/pages/journals/[slug]/guidelines/page"));
const JournalsSlugPeerreviewPage = lazy(() => import("@/pages/journals/[slug]/peer-review/page"));
const JournalsSlugVolumesVolumeidPage = lazy(() => import("@/pages/journals/[slug]/volumes/[volumeId]/page"));
const JournalsSlugVolumesVolumeidIssuesIssueidPage = lazy(() => import("@/pages/journals/[slug]/volumes/[volumeId]/issues/[issueId]/page"));
const LoginPage = lazy(() => import("@/pages/login/page"));
const PeerreviewPage = lazy(() => import("@/pages/peer-review/page"));
const PrivacypolicyPage = lazy(() => import("@/pages/privacy-policy/page"));
const RegisterPage = lazy(() => import("@/pages/register/page"));
const TermsandconditionsPage = lazy(() => import("@/pages/terms-and-conditions/page"));
const AdminPage = lazy(() => import("@/pages/admin/page"));
const AdminApplicationsPage = lazy(() => import("@/pages/admin/applications/page"));
const AdminAssignPage = lazy(() => import("@/pages/admin/assign/page"));
const AdminDecisionsPage = lazy(() => import("@/pages/admin/decisions/page"));
const AdminJournalsPage = lazy(() => import("@/pages/admin/journals/page"));
const AdminJournalsIdWorkspacePage = lazy(() => import("@/pages/admin/journals/[id]/workspace/page"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/settings/page"));
const AdminSubmissionsPage = lazy(() => import("@/pages/admin/submissions/page"));
const AdminSuggestionsPage = lazy(() => import("@/pages/admin/suggestions/page"));
const AdminUsersPage = lazy(() => import("@/pages/admin/users/page"));
const DashboardPage = lazy(() => import("@/pages/dashboard/page"));
const DashboardIssuesPage = lazy(() => import("@/pages/dashboard/issues/page"));
const DashboardProfilePage = lazy(() => import("@/pages/dashboard/profile/page"));
const DashboardSubmissionsPage = lazy(() => import("@/pages/dashboard/submissions/page"));
const DashboardSubmissionsNewPage = lazy(() => import("@/pages/dashboard/submissions/new/page"));
const DashboardSuggestionsPage = lazy(() => import("@/pages/dashboard/suggestions/page"));
const DashboardSuggestionsNewPage = lazy(() => import("@/pages/dashboard/suggestions/new/page"));
const EditorAssignPage = lazy(() => import("@/pages/editor/assign/page"));
const EditorDashboardPage = lazy(() => import("@/pages/editor/dashboard/page"));
const EditorDecisionsPage = lazy(() => import("@/pages/editor/decisions/page"));
const EditorJournalsPage = lazy(() => import("@/pages/editor/journals/page"));
const EditorSubmissionsPage = lazy(() => import("@/pages/editor/submissions/page"));
const EditorSuggestionsPage = lazy(() => import("@/pages/editor/suggestions/page"));
const ReviewerCompletedPage = lazy(() => import("@/pages/reviewer/completed/page"));
const ReviewerDashboardPage = lazy(() => import("@/pages/reviewer/dashboard/page"));
const ReviewerPendingPage = lazy(() => import("@/pages/reviewer/pending/page"));
const ReviewerProfilePage = lazy(() => import("@/pages/reviewer/profile/page"));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<PageSpinner />}>
          <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/archives" element={<ArchivesPage />} />
        <Route path="/articles/:id" element={<ArticlesIdPage />} />
        <Route path="/ethics" element={<EthicsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />
        <Route path="/journals" element={<JournalsPage />} />
        <Route path="/journals/:slug" element={<JournalsSlugPage />} />
        <Route path="/journals/:slug/archives" element={<JournalsSlugArchivesPage />} />
        <Route path="/journals/:slug/ethics" element={<JournalsSlugEthicsPage />} />
        <Route path="/journals/:slug/guidelines" element={<JournalsSlugGuidelinesPage />} />
        <Route path="/journals/:slug/peer-review" element={<JournalsSlugPeerreviewPage />} />
        <Route path="/journals/:slug/volumes/:volumeId" element={<JournalsSlugVolumesVolumeidPage />} />
        <Route path="/journals/:slug/volumes/:volumeId/issues/:issueId" element={<JournalsSlugVolumesVolumeidIssuesIssueidPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/peer-review" element={<PeerreviewPage />} />
        <Route path="/privacy-policy" element={<PrivacypolicyPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms-and-conditions" element={<TermsandconditionsPage />} />
        <Route path="/admin" element={<AdminLayoutRoute />}>
          <Route index element={<AdminPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="assign" element={<AdminAssignPage />} />
          <Route path="decisions" element={<AdminDecisionsPage />} />
          <Route path="journals" element={<AdminJournalsPage />} />
          <Route path="journals/:id/workspace" element={<AdminJournalsIdWorkspacePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="submissions" element={<AdminSubmissionsPage />} />
          <Route path="suggestions" element={<AdminSuggestionsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
        <Route path="/dashboard" element={<AuthorLayoutRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="issues" element={<DashboardIssuesPage />} />
          <Route path="profile" element={<DashboardProfilePage />} />
          <Route path="submissions" element={<DashboardSubmissionsPage />} />
          <Route path="submissions/new" element={<DashboardSubmissionsNewPage />} />
          <Route path="suggestions" element={<DashboardSuggestionsPage />} />
          <Route path="suggestions/new" element={<DashboardSuggestionsNewPage />} />
        </Route>
        <Route path="/editor" element={<EditorLayoutRoute />}>
          <Route path="assign" element={<EditorAssignPage />} />
          <Route path="dashboard" element={<EditorDashboardPage />} />
          <Route path="decisions" element={<EditorDecisionsPage />} />
          <Route path="journals" element={<EditorJournalsPage />} />
          <Route path="submissions" element={<EditorSubmissionsPage />} />
          <Route path="suggestions" element={<EditorSuggestionsPage />} />
        </Route>
        <Route path="/reviewer" element={<ReviewerLayoutRoute />}>
          <Route path="completed" element={<ReviewerCompletedPage />} />
          <Route path="dashboard" element={<ReviewerDashboardPage />} />
          <Route path="pending" element={<ReviewerPendingPage />} />
          <Route path="profile" element={<ReviewerProfilePage />} />
        </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-display text-display-sm font-semibold text-navy-950">404</p>
      <p className="text-ink-600">This page could not be found.</p>
      <a href="/" className="text-brand-700 hover:underline">Back to home</a>
    </div>
  );
}
