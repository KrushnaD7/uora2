import { DashboardRepository } from "./dashboard.repository";

export class DashboardService {
  constructor(
    private repository = new DashboardRepository()
  ) {}

  async getDashboard() {
    const [
      statistics,
      recentSubmissions,
      recentRejectedSubmissions,
      recentArticles,
      monthlySubmissions,
    ] = await Promise.all([
      this.repository.getStatistics(),
      this.repository.getRecentSubmissions(),
      this.repository.getRecentRejectedSubmissions(),
      this.repository.getRecentArticles(),
      this.repository.getMonthlySubmissions(),
    ]);

    return {
      statistics,
      recentSubmissions,
      recentRejectedSubmissions,
      recentArticles,
      monthlySubmissions,
    };
  }
}