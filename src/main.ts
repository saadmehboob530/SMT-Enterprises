import './style.css'

function init(): void {
  // First action, unconditionally: only once this has actually run does the
  // CSS animation system hide anything. See the "Animation system" comment
  // block at the top of style.css.
  document.documentElement.classList.add('js-ready')

  const header = document.querySelector<HTMLElement>('[data-header]')
  const navToggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]')
  const mobileNav = document.querySelector<HTMLElement>('[data-mobile-nav]')

  function setHeaderScrolled(): void {
    if (!header) return
    header.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false'
  }

  setHeaderScrolled()
  window.addEventListener('scroll', setHeaderScrolled, { passive: true })

  function closeMobileNav(): void {
    if (!mobileNav || !navToggle) return
    if (mobileNav.dataset.open !== 'true') return
    mobileNav.classList.remove('is-open')
    mobileNav.dataset.open = 'false'
    navToggle.setAttribute('aria-expanded', 'false')
    navToggle.setAttribute('aria-label', 'Open menu')
    mobileNav.addEventListener(
      'transitionend',
      () => {
        if (mobileNav.dataset.open !== 'true') mobileNav.hidden = true
      },
      { once: true },
    )
  }

  function openMobileNav(): void {
    if (!mobileNav || !navToggle) return
    mobileNav.hidden = false
    mobileNav.dataset.open = 'true'
    navToggle.setAttribute('aria-expanded', 'true')
    navToggle.setAttribute('aria-label', 'Close menu')
    // Double rAF so the browser paints the closed state before we animate to open.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mobileNav.classList.add('is-open')
      })
    })
  }

  navToggle?.addEventListener('click', () => {
    const isOpen = mobileNav?.dataset.open === 'true'
    if (isOpen) {
      closeMobileNav()
    } else {
      openMobileNav()
    }
  })

  mobileNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileNav)
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMobileNav()
  })

  // Scroll-triggered reveals (below-the-fold content).
  const revealTargets = document.querySelectorAll<HTMLElement>('.reveal, .reveal-card, .process-step, .section-fade')

  if ('IntersectionObserver' in window && revealTargets.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )

    revealTargets.forEach((el) => observer.observe(el))
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'))
  }

  // Page-load choreography (header + hero): trigger on the next frame so the
  // browser has painted the initial hidden state first, letting the
  // transitions actually animate rather than snapping straight to visible.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('is-loaded')
    })
  })

  // Highlight the nav link for whichever section is currently in view.
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.main-nav a[href^="#"]')
  const trackedSections: Array<[string, string]> = [
    ['.hero', '#top'],
    ['#services', '#services'],
    ['#solutions', '#solutions'],
    ['#about', '#about'],
    ['#contact', '#contact'],
  ]

  if ('IntersectionObserver' in window && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const match = trackedSections.find(([selector]) => entry.target.matches(selector))
          if (!match) continue
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === match[1])
          })
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )

    trackedSections.forEach(([selector]) => {
      const el = document.querySelector(selector)
      if (el) sectionObserver.observe(el)
    })
  }

  // The <img> renders on its own with no script needed. We only step in to
  // swap to the text fallback if the image is confirmed to have failed —
  // the image stays trusted (and visible) in every other case, including
  // with JavaScript unavailable.
  document.querySelectorAll<HTMLImageElement>('[data-brand-logo]').forEach((img) => {
    const checkLogo = (): void => {
      if (img.naturalWidth === 0) {
        img.closest<HTMLElement>('[data-brand]')?.setAttribute('data-logo-failed', 'true')
      }
    }
    if (img.complete) {
      checkLogo()
    } else {
      img.addEventListener('load', checkLogo)
      img.addEventListener('error', checkLogo)
    }
  })

  const yearEl = document.querySelector<HTMLElement>('[data-year]')
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear())
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!prefersReducedMotion) {
    // Pointer-tracked spotlight on service cards.
    document.querySelectorAll<HTMLElement>('.service-card').forEach((card) => {
      let cardTicking = false
      let cardX = 50
      let cardY = 50

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect()
        cardX = ((event.clientX - rect.left) / rect.width) * 100
        cardY = ((event.clientY - rect.top) / rect.height) * 100

        if (!cardTicking) {
          cardTicking = true
          requestAnimationFrame(() => {
            card.style.setProperty('--mx', `${cardX}%`)
            card.style.setProperty('--my', `${cardY}%`)
            cardTicking = false
          })
        }
      })
    })
  }

  // Contact form delivery.
  //
  // This is a static site with no server, so submissions are delivered via
  // Formspree (https://formspree.io) rather than a custom backend. The
  // endpoint id below is a public identifier, not a secret — Formspree's
  // model is designed for it to live in client-side code. No password, API
  // key or SMTP credential is ever placed in this file. Formspree reads the
  // "email" field automatically and uses it as the Reply-To on the
  // notification it sends, so replying from Gmail reaches the visitor, not
  // this inbox.
  const CONTACT_FORM_ENDPOINT = 'https://formspree.io/f/mwlkrddz'
  const SUBMIT_TIMEOUT_MS = 15000
  const SUCCESS_RESET_MS = 3000

  const contactForm = document.querySelector<HTMLFormElement>('#contact-form')
  if (contactForm) {
    const statusEl = contactForm.querySelector<HTMLElement>('[data-form-status]')
    const submitBtn = contactForm.querySelector<HTMLButtonElement>('[data-submit-btn]')
    const btnLabel = submitBtn?.querySelector<HTMLElement>('[data-btn-label]')
    let isSubmitting = false
    let resetTimer: number | undefined

    const setStatus = (state: 'idle' | 'submitting' | 'success' | 'error', message: string): void => {
      if (!statusEl) return
      statusEl.textContent = message
      statusEl.dataset.state = state
    }

    const setButton = (label: string, busy: boolean): void => {
      if (btnLabel) btnLabel.textContent = label
      if (submitBtn) {
        submitBtn.disabled = busy
        submitBtn.setAttribute('aria-busy', String(busy))
      }
    }

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault()

      if (isSubmitting) return
      if (!contactForm.reportValidity()) return

      if (CONTACT_FORM_ENDPOINT.includes('REPLACE_WITH_FORM_ID')) {
        setStatus('error', 'This form is not yet connected. Please email us directly.')
        return
      }

      window.clearTimeout(resetTimer)
      isSubmitting = true
      setButton('Sending...', true)
      setStatus('submitting', 'Sending your inquiry…')

      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS)

      fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(contactForm),
        signal: controller.signal,
      })
        .then((response) => {
          if (response.ok) {
            setButton('Sent', true)
            setStatus('success', "Your inquiry has been received. We'll review your requirements and get back to you.")
            contactForm.reset()
            resetTimer = window.setTimeout(() => {
              setButton('Send Inquiry', false)
            }, SUCCESS_RESET_MS)
          } else {
            // Formspree returned an error (e.g. validation, rate limit). Keep
            // the visitor's entered data so they can fix and retry.
            setButton('Send Inquiry', false)
            setStatus('error', "We couldn't send your inquiry. Please try again.")
          }
        })
        .catch(() => {
          // Network failure, or the request was aborted after SUBMIT_TIMEOUT_MS.
          setButton('Send Inquiry', false)
          setStatus('error', "We couldn't send your inquiry. Please try again.")
        })
        .finally(() => {
          window.clearTimeout(timeout)
          isSubmitting = false
        })
    })
  }
}

try {
  init()
} catch {
  // If anything above throws, make sure content is not left hidden — the
  // .force-visible failsafe (also set on a timeout in index.html) covers
  // the animation system; nothing else on the page depends on JS to render.
  document.documentElement.classList.add('force-visible')
}
