# Manual UI Testing Checklist for Authentication

## Test Environment Setup

Before running manual tests, ensure:

- [ ] Development server is running (`npm run dev`)
- [ ] Database is running and migrated
- [ ] NextAuth configuration is complete
- [ ] Test with different browsers (Chrome, Firefox, Safari)
- [ ] Test with different screen sizes (mobile, tablet, desktop)

## SignIn Page Visual Tests (`/signin`)

### Layout and Design ✅

- [ ] **Page Title**: "Iniciar Sesión - Glasify" appears in browser tab
- [ ] **Main Heading**: "Iniciar Sesión" is prominently displayed
- [ ] **Description**: "Ingresa a tu cuenta para acceder al panel de administración" is visible
- [ ] **Card Layout**: Form is contained within a centered card component
- [ ] **Responsive**: Layout adapts properly on mobile, tablet, and desktop
- [ ] **Spacing**: Proper spacing between elements (not cramped or too spread out)

### Form Elements ✅

- [ ] **Email Field**:
  - Label "Email" is clearly visible
  - Placeholder text "tu@ejemplo.com" appears
  - Input type is "email" (browser validation kicks in)
  - Auto-complete attribute is set to "email"
  
- [ ] **Password Field**:
  - Label "Contraseña" is clearly visible  
  - Placeholder text "••••••••" appears
  - Input type is "password" (text is masked)
  - Auto-complete attribute is set to "current-password"

- [ ] **Submit Button**:
  - Text "Iniciar Sesión" is visible
  - Button is properly styled (primary button style)
  - Button is enabled when form is valid
  - Shows loading spinner when submitting

- [ ] **Google Button**:
  - Text "Google" with Google icon is visible
  - Button has outline/secondary style
  - Button works independently from credentials form

- [ ] **Separator**:
  - Text "O continúa con" appears between form and Google button
  - Horizontal line separates the options visually

### Form Validation Visual Feedback ✅

Test these scenarios and verify visual feedback:

- [ ] **Empty Form Submission**:
  - Submit empty form
  - Error messages appear: "El email es requerido", "La contraseña es requerida"
  - Error messages are styled consistently (red text, proper spacing)
  - Form fields are highlighted with error state

- [ ] **Invalid Email Format**:
  - Enter "invalid-email" and blur field
  - Error message "Ingresa un email válido" appears below field
  - Error styling is applied to the field

- [ ] **Short Password**:
  - Enter "123" and blur field  
  - Error message "La contraseña debe tener al menos 6 caracteres" appears
  - Error styling is applied to the field

- [ ] **Error Clearing**:
  - After showing validation errors, correct the input
  - Errors should disappear when field becomes valid
  - Field styling should return to normal state

### Interactive States ✅

- [ ] **Focus States**:
  - Tab through form elements
  - Each focusable element shows clear focus indicator
  - Tab order: Email → Password → Submit Button → Google Button

- [ ] **Hover States**:
  - Buttons show hover effects when mouse hovers over them
  - Hover states are visually distinct but not jarring

- [ ] **Loading States**:
  - Submit form with valid data
  - Submit button shows spinner and "Iniciar Sesión" text
  - All form elements become disabled during submission
  - Google button is also disabled during credentials submission

- [ ] **Error States**:
  - Submit with wrong credentials (if auth is configured)
  - Error message appears clearly: "Email o contraseña incorrectos"
  - Form re-enables for retry
  - Error message is prominently displayed

### Accessibility Testing ✅

- [ ] **Keyboard Navigation**:
  - Can navigate entire form using only keyboard
  - Tab order is logical (email → password → buttons)
  - Enter key submits form when in password field
  - Focus indicators are clearly visible

- [ ] **Screen Reader**:
  - All form fields have proper labels
  - Error messages are announced when they appear
  - Button purposes are clear ("Iniciar Sesión", "Google")
  - Heading structure is logical

- [ ] **Color Contrast**:
  - All text has sufficient contrast against background
  - Error states are distinguishable without relying only on color
  - Works in both light and dark modes (if applicable)

### Mobile Responsiveness ✅

Test on various screen sizes:

- [ ] **Mobile (375px)**:
  - Form stacks vertically
  - Buttons are touch-friendly (min 44px height)
  - Text is readable without zooming
  - Horizontal scrolling is not needed

- [ ] **Tablet (768px)**:
  - Form maintains good proportions
  - Touch targets are appropriate
  - Layout is not cramped

- [ ] **Desktop (1200px+)**:
  - Form is centered and not too wide
  - Hover states work properly
  - Focus states are visible

### Browser Compatibility ✅

Test in multiple browsers:

- [ ] **Chrome**: All features work as expected
- [ ] **Firefox**: Form validation and submission work
- [ ] **Safari**: Auto-complete and form features work
- [ ] **Edge**: Consistent behavior across all features

### Performance Testing ✅

- [ ] **Page Load**:
  - Page loads within 2-3 seconds on average connection
  - No visible layout shifts during load
  - Fonts load without causing text to jump

- [ ] **Form Interactions**:
  - Typing in fields is responsive (no lag)
  - Form validation is immediate (not delayed)
  - Button clicks provide immediate feedback

### Authentication Flow Testing ✅

If authentication is configured:

- [ ] **Valid Credentials**:
  - Enter correct email/password
  - Submit redirects to dashboard
  - No errors are shown

- [ ] **Invalid Credentials**:
  - Enter wrong email/password
  - Error message appears clearly
  - Form allows retry without page refresh

- [ ] **Google OAuth** (if configured):
  - Click Google button redirects to Google
  - After Google auth, redirects back to app
  - User is properly authenticated

- [ ] **Already Authenticated**:
  - If user visits /signin while logged in
  - Should redirect to dashboard automatically

### Edge Cases ✅

- [ ] **Network Issues**:
  - Disconnect network during form submission
  - Appropriate error message appears
  - Form recovers when network returns

- [ ] **Slow Connections**:
  - Test on throttled connection
  - Loading states appear appropriately
  - Page is still usable during slow loads

- [ ] **JavaScript Disabled**:
  - Form should still show (but may not submit)
  - Basic styling should remain intact
  - No JavaScript errors in console

## Security Visual Checks ✅

- [ ] **Password Masking**:
  - Password field masks input (shows bullets/dots)
  - Password is not visible in browser dev tools
  - Auto-complete works but doesn't expose password

- [ ] **HTTPS**:
  - Page loads over HTTPS in production
  - No mixed content warnings
  - Form submits over secure connection

## Additional Manual Tests

### Theme Support (if applicable) ✅

- [ ] **Light Mode**: All elements are clearly visible
- [ ] **Dark Mode**: Colors and contrast work properly
- [ ] **System Theme**: Respects user's system preference
- [ ] **Theme Switching**: Smooth transition between themes

### Internationalization (if applicable) ✅

- [ ] **Spanish Text**: All text is in proper Spanish (es-LA)
- [ ] **Text Layout**: Spanish text fits properly in design
- [ ] **Cultural Appropriateness**: Icons and content are appropriate

## Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________
Screen Size: ___________

Overall Score: ___/10

Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

Suggestions:
1. _________________________________
2. _________________________________
3. _________________________________

Ready for Production: [ ] Yes [ ] No
Notes: _________________________________
```

## Critical Issues That Block Production

- [ ] Form doesn't submit
- [ ] Validation errors don't appear
- [ ] Page doesn't load on mobile
- [ ] Authentication flow is broken
- [ ] Major accessibility violations
- [ ] Security vulnerabilities visible

## Nice-to-Have Improvements

- [ ] Better loading animations
- [ ] More detailed error messages
- [ ] Enhanced visual feedback
- [ ] Better responsive breakpoints
- [ ] Additional keyboard shortcuts

---

**Instructions for Manual Testers:**

1. Go through each checklist item systematically
2. Test on multiple devices and browsers
3. Document any issues with screenshots if possible
4. Rate severity: Critical, High, Medium, Low
5. Provide specific steps to reproduce any issues
6. Suggest improvements where applicable

**Note**: This checklist should be updated as new features are added or requirements change.