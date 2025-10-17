# Jerusalem Hills Documentation Index

**Last Updated**: October 2025

This index organizes all documentation files for the Jerusalem Hills project, categorizing them by purpose and current status.

---

## 📋 Quick Reference

| Document | Purpose | Status | Priority |
|----------|---------|--------|----------|
| [README.md](#readme) | Project overview & quick start | ✅ Active | High |
| [CLAUDE.md](#claude) | AI assistant instructions | ✅ Active | High |
| [MarketplaceOperationsPlan.md](#marketplace-ops) | Amazon + Stripe integration strategy | ✅ Active | High |
| [MARKETPLACE_DOCUMENTATION.md](#marketplace-docs) | Stripe/Netlify technical docs | ✅ Active | High |
| [DEPLOYMENT_CHECKLIST.md](#deployment-checklist) | Pre-launch verification | 🟡 Review Needed | Medium |
| [DEPLOYMENT_SUMMARY.md](#deployment-summary) | Deployment status summary | 🟡 Review Needed | Medium |
| [PERFORMANCE_OPTIMIZATION.md](#performance) | Speed & SEO optimization | ✅ Active | Medium |
| [WEBSITE_FIXUP_PLAN.md](#fixup-plan) | Site improvement roadmap | 🔴 Outdated | Low |
| [IMPORT_CHECKLIST.md](#import-checklist) | Migration checklist | 🔴 Outdated | Low |

**Legend**:
- ✅ **Active**: Current, accurate, regularly used
- 🟡 **Review Needed**: May contain outdated info, needs verification
- 🔴 **Outdated**: Superseded or no longer relevant

---

## 📚 Core Documentation

### <a name="readme"></a>README.md
**Purpose**: Main project documentation - architecture, features, deployment

**Key Sections**:
- Project overview
- Tech stack (HTML5, CSS3, vanilla JS, GitHub Pages, Netlify Functions)
- Directory structure
- Quick start guide
- Deployment workflow
- Development commands

**When to Use**: First stop for new developers or stakeholders

**Status**: ✅ **Active** - Primary reference document

---

### <a name="claude"></a>CLAUDE.md
**Purpose**: Instructions for Claude Code AI assistant working on this project

**Key Sections**:
- Project overview & architecture
- Tech stack details
- Development commands
- Deployment workflow
- Important patterns & conventions
- Common development tasks
- Security & compliance notes

**When to Use**: Required reading for AI assistants; useful for developers to understand project conventions

**Status**: ✅ **Active** - Critical for AI-assisted development

---

## 💰 Marketplace Documentation

### <a name="marketplace-ops"></a>MarketplaceOperationsPlan.md
**Purpose**: Comprehensive strategy for Amazon (Associates, FBA, Merch, KDP) + Stripe integration

**Key Sections**:
- Platform model overview
- Amazon Associates setup & implementation
- FBA (Fulfilled by Amazon) configuration
- Merch on Demand integration
- KDP (book publishing) setup
- Stripe hybrid model
- Compliance & disclosure requirements
- Future growth roadmap
- Implementation checklist

**When to Use**:
- Planning marketplace expansion
- Setting up Amazon programs
- Understanding revenue streams
- Strategic planning

**Status**: ✅ **Active** - Primary marketplace strategy document

**Created**: October 2025

---

### <a name="marketplace-docs"></a>MARKETPLACE_DOCUMENTATION.md
**Purpose**: Technical documentation for Stripe + Netlify Functions payment system

**Key Sections**:
- Architecture diagram (GitHub Pages + Netlify + Stripe)
- Current setup (frontend, backend, payment provider)
- Domain configuration
- Testing procedures (live & test mode)
- Environment variables
- File structure
- Adding new products
- Webhook setup
- Monitoring & analytics
- Troubleshooting
- Security configuration
- Emergency procedures

**When to Use**:
- Implementing Stripe payments
- Debugging payment issues
- Adding new products to marketplace
- Configuring webhooks
- Managing environment variables

**Status**: ✅ **Active** - Primary technical reference for payments

**Last Updated**: September 2025

---

## 🚀 Deployment Documentation

### <a name="deployment-checklist"></a>DEPLOYMENT_CHECKLIST.md
**Purpose**: Pre-launch verification checklist

**Status**: 🟡 **Review Needed**

**Action Required**:
- Verify all checklist items are current
- Update with latest security requirements
- Add YouTube carousel verification
- Add marketplace product verification
- Consolidate with DEPLOYMENT_SUMMARY.md (consider merging)

---

### <a name="deployment-summary"></a>DEPLOYMENT_SUMMARY.md
**Purpose**: Summary of deployment status and configurations

**Status**: 🟡 **Review Needed**

**Action Required**:
- Update with current deployment status
- Verify all URLs and endpoints
- Document recent changes (YouTube carousel, marketplace updates)
- Consider merging with DEPLOYMENT_CHECKLIST.md

**Recommendation**: These two deployment docs should be consolidated into one comprehensive deployment guide.

---

## ⚡ Performance & Optimization

### <a name="performance"></a>PERFORMANCE_OPTIMIZATION.md
**Purpose**: Guidelines for improving site speed, SEO, and user experience

**Likely Sections** (verify contents):
- Image optimization
- CSS/JS minification
- Lazy loading
- Caching strategies
- CDN usage
- Mobile performance
- SEO best practices

**When to Use**:
- Before launching new features
- When addressing performance issues
- SEO optimization
- Mobile responsiveness improvements

**Status**: ✅ **Active** (verify contents are current)

---

## 🗂️ Legacy/Archive Documentation

### <a name="fixup-plan"></a>WEBSITE_FIXUP_PLAN.md
**Purpose**: Historical site improvement roadmap

**Status**: 🔴 **Outdated**

**Reason**: Many items likely completed or superseded by newer plans

**Recommendation**: Archive or delete after verifying completed items are documented elsewhere

---

### <a name="import-checklist"></a>IMPORT_CHECKLIST.md
**Purpose**: Migration/import checklist (unclear origin)

**Status**: 🔴 **Outdated**

**Reason**: Appears to be from an initial site migration/setup

**Recommendation**: Archive or delete if no longer relevant

---

## 🎮 Subdirectory Documentation

### Games
- `games/backgammon/README.md` - Backgammon game documentation
- `games/backgammon/IMPROVEMENTS.md` - Planned enhancements

**Status**: ✅ Active (specific to game module)

### Forum
- `forum/README.md` - Forum module documentation

**Status**: ✅ Active (specific to forum module)

---

## 📊 Completed Features Log

### Recent Implementations (October 2025)
✅ **YouTube Video Carousel**
- Restored dynamic video carousel from Jerusalem Hills playlist
- Auto-slide functionality with prev/next navigation
- Responsive design (3 videos desktop, 1 mobile)
- See: `index.html` (lines 303-321), `styles-new.css` (lines 1073-1175)

✅ **Glass & Copper Mezuzah Product**
- Added to marketplace.html ($125)
- Updated homepage Judaica card
- Image: `/market/img/mezuzah1.jpeg`
- See: `index.html` (lines 240-246), `marketplace.html` (lines 743-754)

✅ **Shared Header Component System**
- Created `/components/header.html`
- Dynamic loading via `/js/load-header.js`
- Implemented across all major pages

✅ **Marketplace Hero Redesign**
- Jerusalem Old City market background image
- Purple theme matching site color scheme
- Removed duplicate header

---

## 🔄 Documentation Maintenance Tasks

### High Priority
- [ ] Consolidate DEPLOYMENT_CHECKLIST.md and DEPLOYMENT_SUMMARY.md
- [ ] Update deployment docs with recent changes (YouTube, marketplace)
- [ ] Verify PERFORMANCE_OPTIMIZATION.md contents are current

### Medium Priority
- [ ] Review and update README.md with latest features
- [ ] Document YouTube API key and playlist ID configuration
- [ ] Add troubleshooting section for YouTube carousel

### Low Priority
- [ ] Archive or delete WEBSITE_FIXUP_PLAN.md
- [ ] Archive or delete IMPORT_CHECKLIST.md
- [ ] Create CHANGELOG.md for version tracking

---

## 📖 Recommended Reading Order

### For New Developers:
1. README.md - Project overview
2. CLAUDE.md - Development conventions
3. MARKETPLACE_DOCUMENTATION.md - If working on payments
4. MarketplaceOperationsPlan.md - If working on marketplace strategy

### For Stakeholders/Business:
1. README.md - Project overview
2. MarketplaceOperationsPlan.md - Revenue strategy
3. DEPLOYMENT_CHECKLIST.md - Pre-launch verification

### For AI Assistants:
1. CLAUDE.md - Required reading
2. README.md - Project context
3. Relevant feature-specific docs as needed

---

## 🔗 External Resources

- **GitHub Repository**: https://github.com/JerusalemHills/jerusalemhills.github.io
- **Live Site**: https://jerusalemhills.com
- **Netlify Dashboard**: https://app.netlify.com/sites/jerusalemhills
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Amazon Associates**: https://affiliate-program.amazon.com
- **Google Search Console**: https://search.google.com/search-console

---

## 📝 Notes

- All markdown files use GitHub-flavored markdown
- Code examples use triple backticks with language specifiers
- Internal links use anchor tags for easy navigation
- Last significant documentation overhaul: October 2025

---

**Maintained by**: Jerusalem Hills Development Team
**Contact**: Via GitHub Issues or project repository
