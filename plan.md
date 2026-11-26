# Personal Website — Implementation Plan

> Claude Code için proje spesifikasyonu. Tasarım konsepti: **Midnight Observatory**. Bu isim site markası değildir.

## 0. Claude Code yetki sınırı — zorunlu ve öncelikli

Claude Code yalnızca kaynak kodu, yapılandırma dosyalarını, test kodlarını, README ve CI/CD YAML dosyalarını yazacak veya düzenleyecek. Deployment, çalıştırma, test yürütme ve debugging kullanıcıya aittir. Bu bölüm diğer bölümlerdeki çelişen talimatlardan önceliklidir.

- Repo ve dosyaları salt okunur inceleyebilirsin; gerekli kodları yaz. Paket kurulumu, dev server, build, lint, test, Playwright, Lighthouse veya debug komutlarını çalıştırma. Lockfile üretimi gerekiyorsa kullanıcıya komutu bildir; elle uydurma.
- CI/CD için `ci.yml` ve `deploy.yml` hazırla; deployment workflow yalnızca `workflow_dispatch` ile manuel tetiklensin. Workflow çalıştırma, GitHub Pages ayarlarını değiştirme, secret oluşturma, commit/push veya yayınlama yapma.
- Otomatik hata düzeltme, retry, test-fix-test döngüsü, tarayıcı debug oturumu veya arka plan süreci başlatma. Bir engelle karşılaşırsan raporla ve dur; kullanıcı açıkça isterse ilgili kod düzeltmesini yap.
- Her aşamada değişen dosyaları, varsayımları, bilinen riskleri ve kullanıcının çalıştıracağı komutları kısa biçimde listele. Test/build/deploy durumunu çalıştırılmadı olarak belirt; doğrulanmamış başarı iddia etme.
- Mevcut repo üzerinde önce revize Phase B ve Medium listeleme değişikliklerini uygula; tamamlanmış aşamaları tekrar başlatma. Kodları yazdıktan sonra dur; sonraki aşamalara yalnızca açık onayla geç.

## 1. Amaç ve kapsam

Cemal Gürsel Kar için kişisel mühendislik blogu ve portfolyo oluştur. Site bilgisayar bilimleri, yazılım, AI/ML, matematik ve sistemlere olan merakı yansıtsın; ancak tamamlanmamış çalışmalar veya deneyim hakkında iddia üretmesin. Arthur Rasera'nın kişisel site estetiği bir ilham noktasıdır; kaynak kodu, özgün görselleri veya yerleşimi birebir kopyalama.

Tasarım oranı: %80 modern minimalizm, %15 pixel art, %5 bilgisayar bilimleri estetiği. Bu oranlar görsel kararlar için sezgisel rehberdir. Site bir terminal, işletim sistemi simülasyonu, oyun veya kurumsal landing page değildir.

İlk sürüm: Home, Projects, Blog, About; statik hosting, GitHub entegrasyonu ve küçük animasyonlar. Ana sayfa kısa dikey scroll (masaüstünde yaklaşık 2–3 ekran; içerik ve erişilebilirlik gerektirdiğinde daha uzun olabilir). Mobilde doğal scroll. Varsayılan içerik dili İngilizce önerilir; kullanıcı onayına kadar değiştirilebilir. Türkçe karakterleri destekle.

## 2. Teknoloji ve mimari

| Teknoloji | Karar |
|---|---|
| Astro | Static output, dosya tabanlı routing, HTML-first |
| TypeScript | strict mode, veri şemaları ve etkileşimler |
| Tailwind CSS + native CSS | responsive layout, token tabanlı tasarım, özel animasyon |
| Astro Content Collections | tip güvenli proje içeriği ve Medium makale metadata |
| CSS / SVG / Canvas 2D | progressive enhancement; Canvas yalnızca ihtiyaç halinde |
| Geist Sans + IBM Plex Mono + Pixelify Sans | yerel font dosyaları, font-display: swap |
| Lucide | küçük SVG ikonlar; mümkünse statik SVG, istemci framework'ü yok |
| GitHub REST API | build-time repository metadata |
| Medium RSS | build-time makale metadata; yerel fallback |
| pnpm | paket yönetimi, lockfile commit |
| GitHub Actions + GitHub Pages | test, build, deployment |
| Prettier + ESLint + astro check | format, lint, type check |
| Playwright | smoke, navigation, responsive ve accessibility davranış testleri |

Astro'nun seçilen sürümüyle uyumlu güncel entegrasyonları kullan; Tailwind için uyumlu Vite entegrasyonunu doğrula. Node LTS sürümünü ve paket yöneticisini sabitle. React, Next.js, Three.js, Framer Motion, backend, veritabanı, Docker, CMS ilk sürümde yok. Sırf teknoloji göstermek için bağımlılık ekleme. MDX, KaTeX ve Shiki yalnızca ileride yerel teknik içerik gerekirse kullanılabilir; Medium makaleleri için zorunlu değildir.

## 3. Görsel kimlik

### 3.1 Renkler

CSS custom properties tek doğruluk kaynağı olsun; Tailwind tokenları bunlara bağlansın.

```css
:root {
  color-scheme: dark;
  --bg: #0F101C;
  --surface: #151625;
  --surface-hover: #1D1F32;
  --border: #2B2D42;
  --text: #E2E1EB;
  --muted: #9698AE;
  --accent: #B4A4DE;
  --warm: #DCA478;
  --success: #A6BEA3;
  --radius: 6px;
  --content-max: 1100px;
}
```

Koyu lacivert ağırlıklı; lavanta linklerde, amber küçük detaylarda, yeşil durum göstergelerinde. Neon, glassmorphism, ağır gölge, aşırı gradient, büyük yuvarlak kartlar, terminal taklidi, beceri yüzdesi ve logo duvarı yok. İnce sınırlar, sade hiyerarşi. Metin ve focus kontrastını WCAG AA hedefiyle test et.

### 3.2 Tipografi

Geist Sans: gövde 16px, line-height 1.6; isim 32–36px, bölüm başlıkları 22px, navigasyon 14px. IBM Plex Mono: tarih, dil etiketi, kod, 12–13px. Blog gövdesi 17–18px, line-height 1.75, 65–75 karakterlik satır. Font fallback ve Türkçe glifleri doğrula. Pixelify Sans yalnızca hero başlığında kullanılır; alt içerik modern fontlarla kalır. Hero başlığı clamp(28px, 5vw, 64px), mobilde doğal satır kırılması.

### 3.3 Yerleşim

Full-width immersive hero: ilk ekran kenar boşluksuz, `min-height: 100svh`, genişlik %100. Header hero üzerinde şeffaf; alt içerik `width: min(1100px, calc(100% - 2 * var(--gutter)))` ile ortalanır. Gutter mobil 20px, tablet 28px, masaüstü 32–40px. Section gap 40–56px, kart radius 6px, border 1px. İlk ekranı küçük banner haline getirme; yatay taşma yaratabilecek 100vw yerine width: 100% kullan.

## 4. Ana sayfa

```text
┌──────────────────────────────────────────────────────┐
│ CGK.                       Home Projects Blog About │
│                                                      │
│            Hi! I'm Cemal Gürsel Kar                  │
│                 Computer Engineer                    │
│           FULL-SCREEN PIXEL ART OBSERVATORY          │
│                         ↓                            │
└──────────────────────────────────────────────────────┘
                İlk ekran sonu
       About Me / CV / GitHub / LinkedIn
       Currently exploring ...
       Selected Projects                 View all ↗
       [Repository 1]      [Repository 2]
       Recent Articles                   View all ↗
       Date     Medium article title             ↗
       Date     Medium article title             ↗
       Footer
```

- Hero: insansız gözlemevi görseli tüm ilk ekranı doldurur. `object-fit: cover` ve ayarlanabilir `object-position`; mobil için ayrı crop ayarı. Galaksi ve masa mümkün olduğunca korunsun; farklı ekran oranlarında ikisinin tamamının görünmesi garanti değildir. Görseli esnetme. Hero altına kısa koyu gradient geçişi ekle; genel tasarımda ağır gradient kullanma.
- Başlık gerçek HTML H1: `Hi! I'm Cemal Gürsel Kar`, Pixelify Sans, altında `Computer Engineer`. Gökyüzündeki sakin alana yerleştir, kontrast için lokal hafif koyulaştırma kullan. Metni resme gömme. Navigasyon üstte, scroll oku altta; ok `#about` bölümüne erişilebilir anchor olsun.
- Header: şeffaf hero navigasyonu, alt sayfalarda düz koyu arka plan; mobil menü klavye erişimli. Tema düğmesi yalnızca ikinci tema hazırsa.
- About: kısa gerçek tanıtım, CV ve sosyal linkler; bilinmeyen URL'leri gizle. Currently exploring alanı ve isteğe bağlı küçük matematiksel animasyon.
- Selected Projects: 2–4 gerçek repo, iki kolon; mobil tek kolon. Dürüst empty state.
- Recent Articles: son üç Medium yazısı; tarih, başlık, kısa açıklama (varsa), Medium etiketi ve dış bağlantı oku. Başlığa tıklamak doğrudan Medium makalesine gider. View all yerel `/blog` indeksine gider.
- Footer: yıl, iletişim, GitHub, isteğe bağlı motion toggle. Ana sayfa kısa kalsın; içerik arttıkça indeks sayfalarına taşı.

## 5. Görsel asset ve animasyon sistemi

Kullanıcı tarafından seçilen asset: `a_clean_atmospheric_pixel_art_night_observatory_w.png` (insansız versiyon). Repo içine `src/assets/observatory-night.png` olarak yerleştir. Dosya yoksa kullanıcıdan iste; başka görsel üretme veya internetten rastgele görsel indirme. Orijinali koru. Astro image pipeline ile uygun WebP/AVIF türevleri ve responsive srcset üret; görsel kaliteyi kontrol et. Piksel kenarlarını aşırı blur veya agresif sıkıştırma ile bozma. Hero boyutlarını önceden rezerve et, LCP görselini lazy-load etme.

### 5.1 İlk sürüm (zorunlu)

- Yıldızlar: az sayıda, sabit koordinatlı, düşük opaklıkta yavaş twinkle; CSS veya SVG overlay.
- Kayan yıldız: yaklaşık 30–60 saniyede bir; kısa geçiş, başlangıçta yoğun hareket yok. Görselde mevcut sabit kayan yıldız bulunduğundan çakışma olmasın.
- Monitör: yalnızca ekran bölgesinde küçük imleç veya waveform hareketi; tüm resmi hareket ettirme.
- Kahve buharı: hafif hareketli overlay; görseldeki sabit buharla uyumlu değilse ilk sürümde çıkar ve sonraya bırak.
- Hover/focus: 150–200ms renk ve border geçişi. Sayfa geçişleri hafif fade, JavaScript olmadan normal linkler çalışmalı.

### 5.1.1 Scroll ve geçiş deneyimi (zorunlu)

- Hero ile alt içerik arasında görselin alt kenarında koyu arka plana doğal geçiş; ani kesilme yok.
- Anchor navigasyonunda native `scroll-behavior: smooth`; normal tekerlek/touch scroll davranışına müdahale etme. Scroll hijacking, zorunlu snap, yapay gecikme yok.
- IntersectionObserver ile About, Projects ve Articles bölümlerinde bir kez çalışan hafif reveal: opacity ve 8–16px translateY, 300–450ms ease-out; kartlarda en fazla 60ms stagger. JS kapalıysa veya observer çalışmazsa içerik görünür kalmalı. Focus alan içerik derhal görünür olsun.
- Hero başlığı scroll sırasında isteğe bağlı hafif fade; transform/opacity kullan, layout değişikliği ve yoğun scroll listener yok. Parallax düşük genlikli ve opsiyonel; mobilde kapalı.
- Sayfa geçişleri 150–200ms fade; native navigasyon fallback. `prefers-reduced-motion` ve motion toggle tüm reveal, smooth scroll, parallax ve sürekli animasyonları devre dışı bırakır.
- Statik ve donuk görünmesin, ancak animasyonlar içeriği geciktirmesin veya performansı düşürmesin. İlk ekran ve alt bölümler arasında görsel hiyerarşi korunmalı.

### 5.2 İkinci aşama (opsiyonel)

- Kedi nefes animasyonu: bütün bitmap'i esnetme. Ayrı sprite veya katman gerekiyorsa kullanıcı onayıyla hazırla; yoksa statik bırak.
- Mouse parallax: maksimum 2–4px, yalnızca fine pointer, layout shift yok; mobilde kapalı.
- Küçük matematiksel görsel: 2D Canvas ile dönen wireframe küp (3D noktaların 2D projeksiyonu) veya basit parçacık sistemi. Yaklaşık 100–140px, tek renk lavanta/amber, hover ile hafif tepki; siteye hükmetmesin. Gerçekten iyi görünmüyorsa ekleme.
- Gündüz teması: krem `#F4F2ED`, koyu metin `#292936`, soluk indigo accent. Gündüz görseli ayrı asset olarak hazırlanmalı. İlk sürüm dark-only; sonraki sürümde toggle, localStorage ve ilk render'da tema flash'ını önleme.

### 5.3 Uygulama kuralları

Hero overlay koordinatlarını normalize et (0–1 veya yüzdelik), görsel ve katmanların aynı aspect/crop dönüşümünü kullanmasını sağla. Dekoratif katmanlar `aria-hidden`, `pointer-events: none`. `prefers-reduced-motion` durumunda sürekli animasyon, parallax ve geçişleri durdur; manuel motion toggle ile de durdurulabilsin. Canvas varsa DPR üst sınırı 2, requestAnimationFrame, IntersectionObserver ve visibilitychange ile görünmeyen animasyonu durdur; event listener ve RAF cleanup. Yüksek CPU/GPU yükü ve dev GIF yok. JS devre dışıyken statik hero ve içerik eksiksiz görünmeli.

## 6. Sayfalar ve içerik

### Projects (`/projects`, `/projects/[slug]`)

Seçilen repo listesi, kısa açıklama, dil, teknoloji, isteğe bağlı yıldız sayısı ve güncellenme tarihi, GitHub linki. Kartın başlığı proje detayına, ayrı ikon repo adresine gider; iç içe anchor yok. Detay sayfası: problem, yaklaşım, mimari, deneyler, sonuçlar ve sınırlamalar (yalnızca gerçek veriler), repository linki. Proje yoksa örnek başarı uydurma.

### Blog / Articles (`/blog`)

Yerel sayfa yalnızca Medium yazılarının indeksidir; yeni yerel makale detay route'u oluşturma. Başlık ve dış bağlantı doğrudan orijinal Medium URL'sine gider (aynı sekme varsayılan; yeni sekme seçilirse `rel="noopener noreferrer"` ve erişilebilir uyarı). Tarihe göre ters sırala. Başlık, tarih, kısa düz metin özet, varsa etiket; okuma süresini uydurma. Tam makale içeriğini kopyalama. Mevcut gerçek yerel yazılar varsa izinsiz silme; kullanıcıya raporla. Medium profil bağlantısını yalnızca gerçek adres sağlanırsa göster.

### Medium entegrasyonu

- `mediumFeedUrl?`, `mediumProfileUrl?` config alanları; kullanıcı adresi bilinmiyor, uydurma. Kullanıcının sağlayacağı Medium RSS adresini build-time fetch et; feed erişimi garanti değildir.
- RSS XML'i güvenli parser ile işle; yalnızca title, link, pubDate, kısa düz metin description ve varsa kategori al. Harici HTML render etme, script çalıştırma; HTTPS Medium veya kullanıcı tarafından onaylanan yayın domainlerini doğrula. URL bazında deduplicate, geçerli tarihleri sırala.
- Timeout ve HTTP/XML hatalarında kullanıcı tarafından sağlanan yerel `medium-articles.json` metadata fallback; yoksa dürüst empty state. Tarayıcıdan RSS çağrısı, CORS proxy, backend veya scraping yok.
- Ana sayfada en yeni 3 yazı, `/blog` indeksinde mevcut feed kayıtları ve doğrulanmış yerel arşiv. RSS tüm geçmişi içermeyebilir; güncellemeler manuel build/deploy ile gelir. Otomatik deployment yok.
- Yerel RSS üretmek zorunlu değil; sitemap yalnızca yerel sayfaları içerir. Medium makaleleri için yerel canonical veya detay sayfası üretme.

### About (`/about`)

Kısa biyografi, ilgi alanları, eğitim, CV ve iletişim. Kullanıcının gerçek bilgileri config/content üzerinden gelir. Yeni mezun olma durumunu kalıcı hardcode etme; değiştirilebilir metin. İletişim formu ve backend yok.

### 404

Sade, küçük pixel-art detayı opsiyonel, Home ve Blog bağlantıları. GitHub Pages base path altında çalışmasını doğrula.

## 7. GitHub entegrasyonu

Build-time fetch kullan; ziyaretçinin tarayıcısından API çağrısı yapma. `site.config.ts` içinde GitHub username ve seçili repo slug listesi; gerçek değer bilinmiyorsa boş bırak. `GET /repos/{owner}/{repo}` ile public repo metadata; private repo içeriklerini yayınlama. Token gerekirse GitHub Actions secret/environment üzerinden yalnızca build sürecinde kullan; client bundle'a, loglara, config'e veya git'e yazma. Timeout, 403/429/404 ve ağ hatalarını ele al. API erişilemezse doğrulanmış yerel metadata/cache fallback kullan; yoksa sayısal bilgiyi gizle, 0 uydurma. Ana sayfa repo sırası manuel seçime göre. Proje açıklaması yerel içerikle override edilebilir. Build sırasında güncelleme; otomatik scheduled deployment ekleme. Güncellemenin gerçek zamanlı olmadığını belirt.

## 8. Önerilen dosya yapısı

```text
personal-site/
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
├── public/
│   ├── favicon.svg
│   └── resume.pdf              # yalnızca gerçek dosya sağlanırsa
├── src/
│   ├── assets/observatory-night.png
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ObservatoryHero.astro
│   │   ├── ProfileIntro.astro
│   │   ├── CurrentFocus.astro
│   │   ├── ProjectCard.astro
│   │   ├── PostList.astro
│   │   └── MotionToggle.astro
│   ├── content/
│   │   └── projects/
│   ├── content.config.ts
│   ├── config/site.config.ts
│   ├── layouts/BaseLayout.astro
│   ├── lib/github.ts
│   ├── lib/medium.ts
│   ├── data/medium-articles.json
│   ├── scripts/scroll-motion.ts
│   ├── scripts/observatory.ts
│   ├── styles/tokens.css
│   ├── styles/global.css
│   └── pages/
│       ├── index.astro
│       ├── about.astro
│       ├── 404.astro
│       ├── projects/index.astro
│       ├── projects/[slug].astro
│       └── blog/index.astro
├── tests/
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── README.md
└── plan.md
```

Astro sürümüne göre content collection loader ve route API'lerini uyumlu kullan. Gereksiz boş dosya ve abstraction oluşturma.

### Veri sözleşmeleri

MediumArticle: `title`, `url`, `publishedAt`, `description?`, `tags?`. Tarih ve URL validasyonu; yalnızca gerçek metadata.

Project: `title`, `description`, `repo?`, `technologies`, `featured`, `order?`, `status?`, `draft`. GitHub metadata ayrı typed model. Config: `name`, `role`, `bio`, `locale`, `githubUsername?`, `githubUrl?`, `linkedinUrl?`, `email?`, `resumePath?`, `currentFocus`, `featuredRepos`, `mediumFeedUrl?`, `mediumProfileUrl?`, `siteUrl?`. Bilinmeyen değerleri boş bırak; kullanıcıya eksik alanları raporla.

## 9. SEO, erişilebilirlik, performans

Semantic HTML, tek H1, skip link, görünür focus, klavye navigasyonu, doğru lang, açıklayıcı link adları. Dekoratif hero için boş alt veya bağlama göre kısa açıklama; önemli bilgi yalnızca görselde bulunmasın. Kontrast AA, mobil touch target hedefi 44px. 320px genişlikte sayfa yatay taşmasın (kod ve tablolar kendi container'ında scroll edebilir).

Her sayfaya benzersiz title/description, canonical ve Open Graph; site URL kesinleşince sitemap. Sahte domain veya sosyal hesap kullanma. Analytics ilk sürümde yok. Fontları subset et ama Türkçe karakterleri koru. Hero için makul sıkıştırılmış boyut hedefi 250–500 KB (kaliteye göre); başlangıç JS hedefi gzip 30 KB altı, gereksiz hydration yok. Lighthouse mobile hedefleri performance/accessibility/SEO 90+; ölçüm yapılmadan başarı iddia etme. LCP ≤2.5s, CLS ≤0.1 hedefleri gerçek koşullara bağlıdır. Test ortamını raporla.

## 10. Geliştirme sırası ve kabul kriterleri

### A — Repo inceleme ve temel kurulum

Önce mevcut dosyaları, git durumunu, package manager'ı ve asset'i incele. Mevcut çalışmayı silme veya üzerine yazma. Boş repo ise Astro TypeScript strict ile başlat. pnpm, lint, format, check, build scriptleri. Tasarım tokenları ve BaseLayout. Kabul hedefi (kullanıcı doğrular): dev server ve production build çalışıyor.

### B — Statik UI (öncelik)

Header, full-width 100svh hero ve pixel H1, alt profil, proje kartları, Medium makale listesi, footer; temel scroll reveal ve hero geçişi. 1440, 1024, 768, 390 ve 320px viewportlarda kullanıcı kontrolü için test kodu ve talimat hazırla; preview ve ekran görüntüsü kullanıcıya aittir. Hero crop, renk, boşluk ve scroll uzunluğu onaylanmadan ağır animasyon geliştirme. Kabul: tutarlı hizalama, okunabilirlik, taşma yok, ana sayfa kısa.

### C — İçerik sayfaları

Content Collections, proje detayları, Medium indeks ve build-time RSS/fallback, About, 404. Gerçek içerik yoksa boş durum; test fixture'ları production'a dahil etme. Kabul: Medium linkleri doğrudan kaynağa gider; feed hatası build engellemez.

### D — GitHub entegrasyonu

Typed fetch, timeout, fallback, manuel seçili repo sırası. API hatası simülasyonu için test kodu yaz. Kabul: token sızıntısı yok, offline build fallback ile başarılı, sahte metadata yok.

### E — Motion

Önce twinkle ve monitör; sonra kayan yıldız ve uyumlu buhar. Motion toggle ve reduced-motion. Opsiyonel parallax ve küçük matematiksel obje yalnızca tasarım onayından sonra. Kabul: JS kapalıyken içerik mevcut, animasyon görünmezken duruyor, mobilde performans korunuyor.

### F — Test kodları ve CI/CD YAML (çalıştırma kullanıcıya ait)

`pnpm lint`, `pnpm format:check`, `pnpm check`, `pnpm build`, `pnpm test:e2e` (scriptleri tanımla). Playwright: navigation, mobile menu, no horizontal overflow, Medium external links, RSS fallback, scroll reveal, reduced motion, GitHub fallback, missing optional links. CI install frozen lockfile, check/test/build; deployment yalnızca manuel workflow_dispatch tetiklemesi ve başarılı build sonrası. GitHub Pages için resmi Pages workflow action'ları ve en az yetki. User site ile project site ayrımına göre `site` ve `base` config; internal linkler ve asset yolları base-aware. Domain/repo adı bilinmeden deploy etme. README: local run, Medium feed ve proje ekleme, config, asset, deployment, opsiyonel scheduled rebuild.

## 11. Claude Code çalışma talimatları

- Bu planı uygula; görsel tasarım kararlarını sessizce değiştirme. Belirsiz küçük uygulama ayrıntılarında sade varsayımlar seç ve raporla.
- Önce mevcut repo durumunu incele, ardından uygulanabilir kısa görev listesi çıkar. Tamamlanmış aşamaları tekrar etme; mevcut kodda revize B ve Medium değişikliklerini uygula, sonra dur. Sonraki aşamalara onayla devam et.
- Kullanıcı tarafından seçilen görseli koru. Eksik gerçek profil, GitHub kullanıcı adı, sosyal link, CV veya domain bilgilerini uydurma.
- Her aşamada değişen dosyaları, kullanıcıya önerilen komutları ve açık sorunları özetle. Testleri çalıştırma; sonuçları doğrulanmadı olarak belirt.
- Git commit/push, yayınlama ve secret oluşturma kullanıcıya aittir; mevcut dosyaları izinsiz silme.
- MVP dışında özellik ekleme. Önce çalışan ve görsel olarak tutarlı site, sonra geliştirmeler.

## 12. MVP tamamlanma tanımı

Full-width 100svh observatory hero ve Pixelify Sans H1, Midnight palette, responsive header/profile, gerçek veya dürüst boş durumlu proje/blog listeleri, dört ana sayfa, Medium RSS/fallback ve dış bağlantılar, yumuşak scroll geçişleri, build-time GitHub entegrasyonu, erişilebilir küçük animasyonlar, build ve test kodları, CI/CD YAML ve belgelenmiş manuel GitHub Pages deployment. Başarı kriterlerini kullanıcı çalıştırarak doğrular. Gündüz görseli, tema geçişi, gelişmiş kedi animasyonu, parallax, matematiksel obje, arama, Bookshelf/Notes/Experiments sonraki sürümler için opsiyoneldir.
