import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VariableReplacementService {
  private readonly logger = new Logger(VariableReplacementService.name);

  /**
   * Replace system and custom variables in any content (string or object)
   * @param content - Content to process (string, object, or array)
   * @param locale - Locale for date formatting (optional)
   * @param customVariables - Custom variables map (optional)
   * @returns Processed content with replaced variables
   */
  async replaceVariables(
    content: any,
    locale: string = 'ru-RU',
    customVariables?: Record<string, string>,
  ): Promise<any> {
    if (content === null || content === undefined) {
      return content;
    }

    if (typeof content === 'string') {
      return await this.replaceStringVariables(
        content,
        locale,
        customVariables,
      );
    }

    if (Array.isArray(content)) {
      const promises = content.map((item) =>
        this.replaceVariables(item, locale, customVariables),
      );
      return await Promise.all(promises);
    }

    if (typeof content === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(content)) {
        result[key] = await this.replaceVariables(
          value,
          locale,
          customVariables,
        );
      }
      return result;
    }

    return content;
  }

  /**
   * Synchronous version for backwards compatibility
   */
  replaceVariablesSync(content: any, locale: string = 'ru-RU'): any {
    if (content === null || content === undefined) {
      return content;
    }

    if (typeof content === 'string') {
      return this.replaceStringVariablesSync(content, locale);
    }

    if (Array.isArray(content)) {
      return content.map((item) => this.replaceVariablesSync(item, locale));
    }

    if (typeof content === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(content)) {
        result[key] = this.replaceVariablesSync(value, locale);
      }
      return result;
    }

    return content;
  }

  /**
   * Replace variables in a string (async version with custom variables)
   */
  private async replaceStringVariables(
    text: string,
    locale: string,
    customVariables?: Record<string, string>,
  ): Promise<string> {
    if (typeof text !== 'string') {
      return text;
    }

    try {
      const now = new Date();
      const systemVariables = this.getSystemVariables(now, locale);

      // Combine system and custom variables (custom variables take precedence)
      const allVariables = { ...systemVariables, ...customVariables };

      let result = text;
      for (const [variable, value] of Object.entries(allVariables)) {
        const pattern = new RegExp(`\\[\\*${variable}\\*\\]`, 'gi');
        result = result.replace(pattern, value);
      }

      return result;
    } catch (error) {
      this.logger.warn(`Error replacing variables in text: ${text}`, error);
      return text;
    }
  }

  /**
   * Replace variables in a string (sync version - only system variables)
   */
  private replaceStringVariablesSync(text: string, locale: string): string {
    if (typeof text !== 'string') {
      return text;
    }

    try {
      const now = new Date();
      const variables = this.getSystemVariables(now, locale);

      let result = text;
      for (const [variable, value] of Object.entries(variables)) {
        const pattern = new RegExp(`\\[\\*${variable}\\*\\]`, 'gi');
        result = result.replace(pattern, value);
      }

      return result;
    } catch (error) {
      this.logger.warn(`Error replacing variables in text: ${text}`, error);
      return text;
    }
  }

  /**
   * Get all system variables with their current values
   */
  private getSystemVariables(
    date: Date,
    locale: string,
  ): Record<string, string> {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Create localized date formatters
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const timeFormatter = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const monthNameFormatter = new Intl.DateTimeFormat(locale, {
      month: 'long',
    });

    const monthShortFormatter = new Intl.DateTimeFormat(locale, {
      month: 'short',
    });

    const dayNameFormatter = new Intl.DateTimeFormat(locale, {
      weekday: 'long',
    });

    const dayShortFormatter = new Intl.DateTimeFormat(locale, {
      weekday: 'short',
    });

    return {
      // Year variables
      year: year.toString(),
      currentYear: year.toString(),
      yyyy: year.toString(),
      yy: (year % 100).toString().padStart(2, '0'),

      // Month variables
      month: month.toString().padStart(2, '0'),
      currentMonth: month.toString().padStart(2, '0'),
      mm: month.toString().padStart(2, '0'),
      m: month.toString(),
      monthName: monthNameFormatter.format(date),
      monthShort: monthShortFormatter.format(date),

      // Day variables
      day: day.toString().padStart(2, '0'),
      currentDay: day.toString().padStart(2, '0'),
      dd: day.toString().padStart(2, '0'),
      d: day.toString(),
      dayName: dayNameFormatter.format(date),
      dayShort: dayShortFormatter.format(date),

      // Time variables
      hour: hours.toString().padStart(2, '0'),
      currentHour: hours.toString().padStart(2, '0'),
      hh: hours.toString().padStart(2, '0'),
      h: hours.toString(),
      minute: minutes.toString().padStart(2, '0'),
      currentMinute: minutes.toString().padStart(2, '0'),
      mi: minutes.toString().padStart(2, '0'),
      second: seconds.toString().padStart(2, '0'),
      currentSecond: seconds.toString().padStart(2, '0'),
      ss: seconds.toString().padStart(2, '0'),

      // Formatted date/time
      date: dateFormatter.format(date),
      currentDate: dateFormatter.format(date),
      time: timeFormatter.format(date),
      currentTime: timeFormatter.format(date),
      datetime: `${dateFormatter.format(date)} ${timeFormatter.format(date)}`,
      currentDatetime: `${dateFormatter.format(date)} ${timeFormatter.format(date)}`,

      // Timestamp
      timestamp: date.getTime().toString(),
      currentTimestamp: date.getTime().toString(),

      // ISO formats
      isoDate: date.toISOString().split('T')[0],
      isoTime: date.toTimeString().split(' ')[0],
      isoDatetime: date.toISOString(),

      // Unix timestamp
      unixTimestamp: Math.floor(date.getTime() / 1000).toString(),

      // Week number (ISO 8601)
      weekNumber: this.getWeekNumber(date).toString(),
      currentWeek: this.getWeekNumber(date).toString(),

      // Quarter
      quarter: Math.ceil(month / 3).toString(),
      currentQuarter: Math.ceil(month / 3).toString(),
    };
  }

  /**
   * Get ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Get list of all available system variables
   */
  getAvailableVariables(): string[] {
    const sampleDate = new Date();
    const variables = this.getSystemVariables(sampleDate, 'ru-RU');
    return Object.keys(variables).map((key) => `[*${key}*]`);
  }

  /**
   * Replace variables in JSON string (async version)
   */
  async replaceVariablesInJson(
    jsonString: string,
    locale: string = 'ru-RU',
    customVariables?: Record<string, string>,
  ): Promise<string> {
    try {
      const parsed = JSON.parse(jsonString);
      const processed = await this.replaceVariables(
        parsed,
        locale,
        customVariables,
      );
      return JSON.stringify(processed);
    } catch (error) {
      this.logger.warn(`Error processing JSON string: ${jsonString}`, error);
      // If JSON parsing fails, treat as regular string
      return await this.replaceStringVariables(
        jsonString,
        locale,
        customVariables,
      );
    }
  }

  /**
   * Replace variables in JSON string (sync version - only system variables)
   */
  replaceVariablesInJsonSync(
    jsonString: string,
    locale: string = 'ru-RU',
  ): string {
    try {
      const parsed = JSON.parse(jsonString);
      const processed = this.replaceVariablesSync(parsed, locale);
      return JSON.stringify(processed);
    } catch (error) {
      this.logger.warn(`Error processing JSON string: ${jsonString}`, error);
      // If JSON parsing fails, treat as regular string
      return this.replaceStringVariablesSync(jsonString, locale);
    }
  }
}
