
type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";

export function generateTrafficData(timeFrame: TimeFrame) {
  const count = getDataPointCount(timeFrame);
  const data = [];
  
  let baseValue = 800;
  const variability = 0.2; // 20% variability
  
  const dates = generateDateLabels(timeFrame, count);
  
  for (let i = 0; i < count; i++) {
    // Create realistic traffic pattern with some random variance
    const dayOfWeek = new Date(dates[i]).getDay();
    
    // Weekend traffic is typically lower
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1;
    
    // Add a slight upward trend
    const trendFactor = 1 + (i * 0.01);
    
    // Add some randomness
    const randomFactor = 1 + ((Math.random() * 2 - 1) * variability);
    
    // Calculate the value with all factors
    const value = Math.round(baseValue * weekendFactor * trendFactor * randomFactor);
    
    data.push({
      name: getLabelForTimeFrame(timeFrame, i, dates),
      value,
      date: dates[i],
    });
  }
  
  return data;
}

export function generateRevenueData(timeFrame: TimeFrame) {
  const count = getDataPointCount(timeFrame);
  const data = [];
  
  let baseValue = 300;
  const variability = 0.3; // 30% variability
  
  const dates = generateDateLabels(timeFrame, count);
  
  for (let i = 0; i < count; i++) {
    // Create realistic revenue pattern
    const dayOfWeek = new Date(dates[i]).getDay();
    
    // Weekend revenue might be higher for some businesses
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.1 : 1;
    
    // Add a stronger upward trend for revenue
    const trendFactor = 1 + (i * 0.015);
    
    // Add larger randomness to revenue
    const randomFactor = 1 + ((Math.random() * 2 - 1) * variability);
    
    // Calculate the value with all factors
    const value = Math.round(baseValue * weekendFactor * trendFactor * randomFactor);
    
    data.push({
      name: getLabelForTimeFrame(timeFrame, i, dates),
      value,
      date: dates[i],
    });
  }
  
  return data;
}

function getDataPointCount(timeFrame: TimeFrame): number {
  switch (timeFrame) {
    case "daily":
      return 14; // Two weeks
    case "weekly":
      return 12; // 12 weeks (quarter)
    case "monthly":
      return 12; // 12 months (year)
    case "yearly":
      return 5; // 5 years
    default:
      return 30;
  }
}

function getLabelForTimeFrame(timeFrame: TimeFrame, index: number, dates: string[]): string {
  const date = new Date(dates[index]);
  
  switch (timeFrame) {
    case "daily":
      // Format: "Mon 15"
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    case "weekly":
      // Format: "Week 23"
      return `Week ${getWeekNumber(date)}`;
    case "monthly":
      // Format: "Jan"
      return date.toLocaleDateString('en-US', { month: 'short' });
    case "yearly":
      // Format: "2023"
      return date.getFullYear().toString();
    default:
      return "";
  }
}

function generateDateLabels(timeFrame: TimeFrame, count: number): string[] {
  const dates = [];
  const today = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today);
    
    switch (timeFrame) {
      case "daily":
        date.setDate(today.getDate() - i);
        break;
      case "weekly":
        date.setDate(today.getDate() - (i * 7));
        break;
      case "monthly":
        date.setMonth(today.getMonth() - i);
        break;
      case "yearly":
        date.setFullYear(today.getFullYear() - i);
        break;
    }
    
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

// Helper to get week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
