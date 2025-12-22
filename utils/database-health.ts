// utils/database-health.ts
import { sql } from "@/db";

export class DatabaseHealth {
  private static lastChecked: number = 0;
  private static checkInterval = 60000; // 1 minute
  private static isHealthy = true;

  static async checkHealth(): Promise<boolean> {
    const now = Date.now();

    // Only check if enough time has passed
    if (now - this.lastChecked < this.checkInterval && this.isHealthy) {
      return this.isHealthy;
    }

    try {
      // Simple query to check database health
      await sql`SELECT 1`;
      this.isHealthy = true;
      this.lastChecked = now;
      console.log("Database health check: ✅ Healthy");
      return true;
    } catch (error) {
      this.isHealthy = false;
      this.lastChecked = now;
      console.error(
        "Database health check: ❌ Unhealthy",
        error instanceof Error ? error.message : String(error)
      );
      return false;
    }
  }

  static async wakeUpDatabase(): Promise<boolean> {
    console.log("Attempting to wake up database...");

    // Try multiple simple queries to wake up the database
    for (let i = 0; i < 3; i++) {
      try {
        await sql`SELECT 1`;
        this.isHealthy = true;
        console.log("Database woken up successfully!");
        return true;
      } catch (error) {
        console.warn(
          `Wake-up attempt ${i + 1} failed:`,
          error instanceof Error ? error.message : String(error)
        );
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }

    console.error("Failed to wake up database after multiple attempts");
    this.isHealthy = false;
    return false;
  }

  static getStatus(): { healthy: boolean; lastChecked: number } {
    return {
      healthy: this.isHealthy,
      lastChecked: this.lastChecked,
    };
  }
}
