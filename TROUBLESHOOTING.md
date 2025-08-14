# Troubleshooting Guide

## Common Issues and Solutions

### Security Headers Errors

#### "Error with Permissions-Policy header: Unrecognized feature: 'browsing-topics'"

**Cause**: Some browsers or hosting providers automatically add unsupported features to Permissions-Policy headers.

**Solutions**:

1. **Option 1: Remove Permissions-Policy completely**
   ```apache
   # In .htaccess, comment out the Permissions-Policy line:
   # Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
   ```

2. **Option 2: Use Feature-Policy instead (for older browsers)**
   ```apache
   Header always set Feature-Policy "geolocation 'none'; microphone 'none'; camera 'none'"
   ```

3. **Option 3: Check your hosting provider**
   - Some hosting providers (like GitHub Pages, Netlify) add their own headers
   - Check if your hosting provider is adding the 'browsing-topics' feature
   - Contact support if the error persists

#### "X-Frame-Options may only be set via an HTTP header"

**Cause**: X-Frame-Options cannot be set via HTML meta tags.

**Solution**: Ensure your server configuration includes:
```apache
Header always set X-Frame-Options "DENY"
```

### Browser Compatibility Issues

#### CSP Violations in Console

**Cause**: Content Security Policy is too restrictive.

**Solutions**:
1. Check the exact violation in browser console
2. Add the required domain to CSP:
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://yourdomain.com;">
   ```

#### Features Not Working in Older Browsers

**Cause**: Modern JavaScript/CSS features not supported.

**Solutions**:
1. Add polyfills for required features
2. Implement progressive enhancement
3. Test with Browser Stack or similar services

### Performance Issues

#### Slow Loading Times

**Solutions**:
1. Enable gzip compression (check .htaccess file)
2. Optimize images and assets
3. Use a CDN for static files
4. Minify CSS and JavaScript

#### Poor Lighthouse Scores

**Common Fixes**:
1. **Performance**: Add resource preloading, optimize images
2. **Accessibility**: Ensure all images have alt text, proper heading hierarchy
3. **Best Practices**: Fix any remaining console errors
4. **SEO**: Add meta descriptions, proper title tags

### Hosting-Specific Issues

#### GitHub Pages

**Limitations**:
- Cannot set custom HTTP headers
- Limited server configuration
- Some security headers won't work

**Solutions**:
- Use HTML meta tags where possible
- Accept that some headers cannot be set
- Consider alternative hosting for production

#### Netlify

**Configuration**:
Create `_headers` file in root:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

#### Vercel

**Configuration**:
Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "X-Content-Type-Options", "value": "nosniff"}
      ]
    }
  ]
}
```

### Development Issues

#### Local Testing Problems

**Solutions**:
1. Use a local server (not file:// protocol)
2. Install Live Server extension for VS Code
3. Use Python's built-in server: `python -m http.server 8000`

#### CORS Issues During Development

**Solutions**:
1. Use same origin for all resources
2. Configure your development server to allow CORS
3. Use a proxy during development

### Analytics Issues

#### Google Analytics Not Working

**Check**:
1. Replace `GA_MEASUREMENT_ID` with actual tracking ID
2. Verify CSP allows Google Analytics domains
3. Check for ad blockers blocking analytics

#### Privacy Compliance

**Ensure**:
1. GDPR compliance if serving EU users
2. Cookie consent if required by law
3. Privacy policy mentions analytics usage

## Getting Help

If you're still experiencing issues:

1. **Check browser console** for specific error messages
2. **Test in incognito mode** to rule out extensions
3. **Try different browsers** to identify browser-specific issues
4. **Check hosting provider documentation** for platform-specific limitations
5. **Search for specific error messages** online
6. **Open an issue** in the project repository with:
   - Browser version and type
   - Exact error message
   - Steps to reproduce
   - Hosting platform being used

## Useful Testing Tools

- **Security Headers**: https://securityheaders.com/
- **CSP Evaluator**: https://csp-evaluator.withgoogle.com/
- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: https://webpagetest.org/
- **GTmetrix**: https://gtmetrix.com/
- **WAVE**: https://wave.webaim.org/ (accessibility testing)