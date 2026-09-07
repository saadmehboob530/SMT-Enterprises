import './style.css'

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
  mobileNav.dataset.open = 'false'
  mobileNav.hidden = true
  navToggle.setAttribute('aria-expanded', 'false')
  navToggle.setAttribute('aria-label', 'Open menu')
}

function openMobileNav(): void {
  if (!mobileNav || !navToggle) return
  mobileNav.hidden = false
  mobileNav.dataset.open = 'true'
  navToggle.setAttribute('aria-expanded', 'true')
  navToggle.setAttribute('aria-label', 'Close menu')
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

const revealTargets = document.querySelectorAll<HTMLElement>('.reveal')

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

const yearEl = document.querySelector<HTMLElement>('[data-year]')
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear())
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!prefersReducedMotion) {
  // Pointer-tracked spotlight glow on service cards.
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

  // Subtle hero parallax following the pointer.
  const hero = document.querySelector<HTMLElement>('.hero')
  if (hero) {
    let ticking = false
    let pendingX = 0
    let pendingY = 0

    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect()
      pendingX = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      pendingY = ((event.clientY - rect.top) / rect.height - 0.5) * 2

      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          hero.style.setProperty('--mx', pendingX.toFixed(3))
          hero.style.setProperty('--my', pendingY.toFixed(3))
          ticking = false
        })
      }
    })
  }
}
