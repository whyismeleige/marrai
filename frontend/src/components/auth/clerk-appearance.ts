// Clerk appearance config — matches Marrai design system
// Aggressively hides Clerk's built-in chrome (header, footer, branding)
// since AuthShell provides all surrounding UI.

export const clerkAppearance = {
  variables: {
    colorPrimary:           'oklch(0.55 0.23 264)',
    colorBackground:        'transparent',
    colorInputBackground:   'var(--input)',
    colorInputText:         'var(--foreground)',
    colorText:              'var(--foreground)',
    colorTextSecondary:     'var(--muted-foreground)',
    colorNeutral:           'var(--muted-foreground)',
    colorDanger:            'oklch(0.57 0.22 25)',
    colorSuccess:           'oklch(0.65 0.18 142)',
    fontFamily:             'var(--font-sans)',
    fontSize:               '14px',
    fontWeight:             { normal: 400, medium: 500, bold: 700 } as any,
    borderRadius:           '0.75rem',
    spacingUnit:            '1rem',
  },
  elements: {
    // ── Remove all Clerk card/box chrome ────────────────
    card:                             'bg-transparent shadow-none border-0 p-0 m-0 w-full',
    cardBox:                          'shadow-none w-full bg-transparent',
    rootBox:                          'w-full',

    // ── Hide Clerk's built-in header & footer ───────────
    // (AuthShell renders its own heading and toggle links)
    header:                           'hidden',

    // The footer contains "Don't have an account? Sign up",
    // "Secured by Clerk", and the dev-mode banner — hide all of it.
    footer:                           '!hidden',
    footerAction:                     '!hidden',
    footerActionLink:                 '!hidden',
    footerActionText:                 '!hidden',
    footerPages:                      '!hidden',
    footerPageLink:                   '!hidden',
    // Clerk sometimes uses these class names for the branding row
    'cl-internal-b3fm6y':             '!hidden',

    // ── Social / OAuth buttons ───────────────────────────
    socialButtonsBlockButton:         [
      'bg-card border border-border text-foreground',
      'text-sm font-medium rounded-xl h-10 gap-2.5',
      'hover:bg-muted hover:border-border/80',
      'transition-all duration-150',
    ].join(' '),
    socialButtonsBlockButtonText:     'font-medium text-sm',
    socialButtonsProviderIcon:        'h-4 w-4',

    // ── Divider ──────────────────────────────────────────
    dividerLine:                      'bg-border',
    dividerText:                      'text-muted-foreground text-xs',

    // ── Form labels ──────────────────────────────────────
    formFieldLabel:                   'text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1',

    // ── Inputs ───────────────────────────────────────────
    formFieldInput:                   [
      'bg-input border border-border text-foreground text-sm',
      'rounded-xl h-10 px-3',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
      'placeholder:text-muted-foreground/50',
      'transition-all',
    ].join(' '),
    formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-foreground transition-colors',
    formFieldRow:                     'gap-3',
    formFieldErrorText:               'text-xs text-destructive mt-1',

    // ── Primary action button ────────────────────────────
    formButtonPrimary:                [
      'bg-primary text-primary-foreground',
      'font-semibold text-sm rounded-xl h-10 w-full',
      'hover:opacity-90 active:scale-[0.98]',
      'transition-all shadow-sm',
    ].join(' '),

    // ── Ghost / reset button ─────────────────────────────
    formButtonReset:                  'text-muted-foreground text-sm font-medium hover:text-foreground transition-colors',

    // ── Alerts ───────────────────────────────────────────
    alertText:                        'text-sm',
    alert:                            'rounded-xl border',

    // ── OTP inputs ───────────────────────────────────────
    otpCodeFieldInput:                [
      'bg-input border border-border text-foreground',
      'text-lg font-bold rounded-xl',
      'focus:ring-2 focus:ring-ring focus:border-transparent',
      'transition-all',
    ].join(' '),

    // ── Identity preview ─────────────────────────────────
    identityPreviewText:              'text-sm text-foreground',
    identityPreviewEditButton:        'text-primary text-xs font-medium hover:underline',

    // ── Layout spacing ───────────────────────────────────
    main:                             'gap-4',
    form:                             'gap-4',
  },
}