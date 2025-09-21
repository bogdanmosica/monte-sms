// Accessibility utilities for shadcn/ui components
// This module provides accessibility checking and enhancement utilities

import { type RefObject, useEffect, useState } from 'react';

export interface AccessibilityIssue {
  severity: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  element?: string;
  suggestion?: string;
}

export interface AccessibilityReport {
  score: number; // 0-100
  issues: AccessibilityIssue[];
  passedChecks: string[];
  totalChecks: number;
}

// Color contrast utilities
export function getContrastRatio(
  foreground: string,
  background: string
): number {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Get relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) return 0;

  const fgLum = getLuminance(fg.r, fg.g, fg.b);
  const bgLum = getLuminance(bg.r, bg.g, bg.b);

  const brightest = Math.max(fgLum, bgLum);
  const darkest = Math.min(fgLum, bgLum);

  return (brightest + 0.05) / (darkest + 0.05);
}

// WCAG compliance checkers
export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3;
export const WCAG_AAA_NORMAL = 7;
export const WCAG_AAA_LARGE = 4.5;

export function checkColorContrast(
  foreground: string,
  background: string,
  textSize: 'normal' | 'large' = 'normal',
  level: 'AA' | 'AAA' = 'AA'
): { passes: boolean; ratio: number; required: number } {
  const ratio = getContrastRatio(foreground, background);

  let required: number;
  if (level === 'AAA') {
    required = textSize === 'large' ? WCAG_AAA_LARGE : WCAG_AAA_NORMAL;
  } else {
    required = textSize === 'large' ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
  }

  return {
    passes: ratio >= required,
    ratio,
    required,
  };
}

// Keyboard navigation checker
export function checkKeyboardNavigation(
  element: HTMLElement
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check if interactive elements are focusable
  const interactiveElements = element.querySelectorAll(
    'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
  );

  interactiveElements.forEach((el, index) => {
    const htmlEl = el as HTMLElement;

    // Check tabindex
    const tabIndex = htmlEl.getAttribute('tabindex');
    if (tabIndex && parseInt(tabIndex) < 0 && !htmlEl.disabled) {
      issues.push({
        severity: 'warning',
        rule: 'keyboard-navigation',
        message: 'Interactive element has negative tabindex',
        element: htmlEl.tagName.toLowerCase(),
        suggestion:
          'Remove negative tabindex or ensure element is not interactive',
      });
    }

    // Check for missing keyboard event handlers
    if (htmlEl.onclick && !htmlEl.onkeydown && !htmlEl.onkeypress) {
      issues.push({
        severity: 'error',
        rule: 'keyboard-events',
        message: 'Element has click handler but no keyboard event handler',
        element: htmlEl.tagName.toLowerCase(),
        suggestion: 'Add onKeyDown handler to support keyboard interaction',
      });
    }
  });

  return issues;
}

// ARIA attributes checker
export function checkARIA(element: HTMLElement): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for missing labels
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    const htmlInput = input as HTMLInputElement;
    const hasLabel =
      htmlInput.getAttribute('aria-label') ||
      htmlInput.getAttribute('aria-labelledby') ||
      element.querySelector(`label[for="${htmlInput.id}"]`) ||
      htmlInput.closest('label');

    if (!hasLabel && htmlInput.type !== 'hidden') {
      issues.push({
        severity: 'error',
        rule: 'missing-label',
        message: 'Form input missing accessible label',
        element: htmlInput.tagName.toLowerCase(),
        suggestion:
          'Add aria-label, aria-labelledby, or associate with a label element',
      });
    }
  });

  // Check button accessibility
  const buttons = element.querySelectorAll('button, [role="button"]');
  buttons.forEach((button) => {
    const htmlButton = button as HTMLButtonElement;
    const hasAccessibleName =
      htmlButton.textContent?.trim() ||
      htmlButton.getAttribute('aria-label') ||
      htmlButton.getAttribute('aria-labelledby');

    if (!hasAccessibleName) {
      issues.push({
        severity: 'error',
        rule: 'button-name',
        message: 'Button missing accessible name',
        element: htmlButton.tagName.toLowerCase(),
        suggestion: 'Add visible text content or aria-label',
      });
    }
  });

  // Check for proper heading hierarchy
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > lastLevel + 1) {
      issues.push({
        severity: 'warning',
        rule: 'heading-hierarchy',
        message: `Heading level skips from h${lastLevel} to h${level}`,
        element: heading.tagName.toLowerCase(),
        suggestion:
          'Use sequential heading levels for proper document structure',
      });
    }
    lastLevel = level;
  });

  return issues;
}

// Focus management checker
export function checkFocusManagement(
  element: HTMLElement
): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for focus traps in modals/dialogs
  const modals = element.querySelectorAll(
    '[role="dialog"], [role="alertdialog"], .modal'
  );
  modals.forEach((modal) => {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      issues.push({
        severity: 'error',
        rule: 'focus-trap',
        message: 'Modal/dialog contains no focusable elements',
        element: 'dialog',
        suggestion: 'Ensure modals have at least one focusable element',
      });
    }
  });

  // Check for skip links
  const firstFocusable = element.querySelector(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (
    firstFocusable &&
    !element.querySelector('.skip-link, [href="#main-content"]')
  ) {
    issues.push({
      severity: 'warning',
      rule: 'skip-navigation',
      message: 'Missing skip navigation link',
      suggestion: 'Add skip link to main content for keyboard users',
    });
  }

  return issues;
}

// Main accessibility audit function
export function auditAccessibility(element: HTMLElement): AccessibilityReport {
  const issues: AccessibilityIssue[] = [];
  const passedChecks: string[] = [];

  // Run all checks
  const keyboardIssues = checkKeyboardNavigation(element);
  const ariaIssues = checkARIA(element);
  const focusIssues = checkFocusManagement(element);

  issues.push(...keyboardIssues, ...ariaIssues, ...focusIssues);

  // Track passed checks
  const totalInputs = element.querySelectorAll(
    'input, select, textarea'
  ).length;
  const inputsWithLabels = issues.filter(
    (i) => i.rule === 'missing-label'
  ).length;
  if (totalInputs > 0 && inputsWithLabels === 0) {
    passedChecks.push('All form inputs have labels');
  }

  const totalButtons = element.querySelectorAll(
    'button, [role="button"]'
  ).length;
  const buttonsWithoutNames = issues.filter(
    (i) => i.rule === 'button-name'
  ).length;
  if (totalButtons > 0 && buttonsWithoutNames === 0) {
    passedChecks.push('All buttons have accessible names');
  }

  if (keyboardIssues.length === 0) {
    passedChecks.push('Keyboard navigation is properly implemented');
  }

  if (focusIssues.length === 0) {
    passedChecks.push('Focus management is correct');
  }

  // Calculate score
  const totalChecks = 10; // Base number of accessibility checks
  const errorWeight = 3;
  const warningWeight = 1;

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  const penalties = errorCount * errorWeight + warningCount * warningWeight;
  const score = Math.max(0, 100 - penalties * 5);

  return {
    score,
    issues,
    passedChecks,
    totalChecks,
  };
}

// Utility to generate accessibility report
export function generateAccessibilityReport(
  report: AccessibilityReport
): string {
  const { score, issues, passedChecks } = report;

  let reportText = `# Accessibility Report\n\n`;
  reportText += `**Overall Score: ${score}/100**\n\n`;

  if (passedChecks.length > 0) {
    reportText += `## ✅ Passed Checks (${passedChecks.length})\n`;
    passedChecks.forEach((check) => {
      reportText += `- ${check}\n`;
    });
    reportText += '\n';
  }

  if (issues.length > 0) {
    reportText += `## ⚠️ Issues Found (${issues.length})\n\n`;

    const errors = issues.filter((i) => i.severity === 'error');
    const warnings = issues.filter((i) => i.severity === 'warning');
    const info = issues.filter((i) => i.severity === 'info');

    if (errors.length > 0) {
      reportText += `### 🚨 Errors (${errors.length})\n`;
      errors.forEach((issue) => {
        reportText += `- **${issue.rule}**: ${issue.message}\n`;
        if (issue.suggestion) {
          reportText += `  - *Suggestion: ${issue.suggestion}*\n`;
        }
      });
      reportText += '\n';
    }

    if (warnings.length > 0) {
      reportText += `### ⚠️ Warnings (${warnings.length})\n`;
      warnings.forEach((issue) => {
        reportText += `- **${issue.rule}**: ${issue.message}\n`;
        if (issue.suggestion) {
          reportText += `  - *Suggestion: ${issue.suggestion}*\n`;
        }
      });
      reportText += '\n';
    }

    if (info.length > 0) {
      reportText += `### ℹ️ Information (${info.length})\n`;
      info.forEach((issue) => {
        reportText += `- **${issue.rule}**: ${issue.message}\n`;
        if (issue.suggestion) {
          reportText += `  - *Suggestion: ${issue.suggestion}*\n`;
        }
      });
    }
  } else {
    reportText += `## 🎉 No Issues Found!\n\nThis component meets basic accessibility requirements.\n`;
  }

  return reportText;
}

// React hook for runtime accessibility checking
export function useAccessibilityChecker(elementRef: RefObject<HTMLElement>) {
  const [report, setReport] = useState<AccessibilityReport | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      const auditResult = auditAccessibility(elementRef.current);
      setReport(auditResult);
    }
  }, [elementRef]);

  return report;
}

// Enhanced component props for accessibility
export interface AccessibleComponentProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  role?: string;
  tabIndex?: number;
}

// High contrast theme detection
export function detectHighContrast(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(prefers-contrast: high)').matches ||
    window.matchMedia('(-ms-high-contrast: active)').matches
  );
}

// Reduced motion detection
export function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Screen reader detection
export function detectScreenReader(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for common screen reader indicators
  return !!(
    window.navigator.userAgent.includes('NVDA') ||
    window.navigator.userAgent.includes('JAWS') ||
    window.speechSynthesis ||
    document.querySelector('[aria-live]')
  );
}
