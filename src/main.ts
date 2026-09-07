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
