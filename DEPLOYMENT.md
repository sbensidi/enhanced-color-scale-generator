# Deployment Guide - Color Scale Generator

## Security Headers Configuration

### Important Note
Some security headers cannot be set via HTML meta tags and require server-level configuration. This project includes both HTML meta tags (for basic CSP) and server configuration examples.

### Errors You Might See
If you see these errors in the browser console, they are expected and should be resolved by proper server configuration:

```
Error with Permissions-Policy header: Unrecognized feature: 'browsing-topics'.
X-Frame-Options may only be set via an HTTP header sent along with a document.
```

## Server Configuration

### Apache (.htaccess)
The included `.htaccess` file provides:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Permissions-Policy for sensitive features
- Gzip compression
- Cache headers for static assets

### Nginx
Use the provided `nginx.conf.example` as a reference for your Nginx configuration.

### Static Hosting (Netlify, Vercel, GitHub Pages)

#### Netlify
Create a `_headers` file:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Referrer-Policy: strict-origin-when-cross-origin
```

#### Vercel
Create a `vercel.json` file:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

#### GitHub Pages
GitHub Pages has limited header configuration. The HTML meta tags will provide basic security, but some headers won't be available.

## Performance Optimization

### Before Deployment
1. **Minify CSS and JavaScript** (if using a build process)
2. **Optimize images** (though this project uses minimal images)
3. **Enable compression** (gzip/brotli)
4. **Set up CDN** for better global performance

### Recommended Build Process
```bash
# Example with basic minification
npm install -g clean-css-cli uglify-js html-minifier

# Minify CSS
cleancss -o dist/css/styles.min.css css/*.css

# Minify JS (if needed)
uglifyjs js/*.js -o dist/js/app.min.js

# Minify HTML
html-minifier --remove-comments --collapse-whitespace index.html -o dist/index.html
```

## Environment Variables

### Google Analytics
Update the analytics configuration:
1. Replace `GA_MEASUREMENT_ID` in the code with your actual Google Analytics ID
2. Or remove analytics code if not needed

### API Configuration
The app uses the color.pizza API. No API key is required, but ensure the CSP allows the domain.

## Testing Before Deployment

### Security Testing
1. Run security headers check: https://securityheaders.com/
2. Test CSP compliance: Browser developer tools console
3. Verify XSS protection: Manual testing with XSS payloads

### Performance Testing
1. Lighthouse audit (aim for 90+ in all categories)
2. WebPageTest.org for detailed performance metrics
3. Core Web Vitals testing

### Accessibility Testing
1. Lighthouse accessibility audit (aim for 100)
2. Screen reader testing
3. Keyboard navigation testing
4. Color contrast verification

## Production Checklist

- [ ] Security headers configured at server level
- [ ] CSS and JS minified
- [ ] Images optimized
- [ ] Analytics ID updated (or removed)
- [ ] HTTPS enabled with HSTS header
- [ ] Cache headers configured
- [ ] Compression enabled
- [ ] Error pages configured
- [ ] Performance tested (Lighthouse 90+)
- [ ] Security tested (SecurityHeaders.com A+)
- [ ] Cross-browser tested
- [ ] Mobile responsiveness verified

## Monitoring

### Error Tracking
The app includes built-in error handling. Consider integrating with:
- Sentry
- LogRocket
- Bugsnag

### Performance Monitoring
Built-in Web Vitals monitoring. Consider:
- Google Analytics 4
- New Relic
- DataDog

### Uptime Monitoring
- Pingdom
- UptimeRobot
- StatusCake