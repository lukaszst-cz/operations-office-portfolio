<?php
get_header();
$services = [
    ['01', 'Landing page', 'od 2 900 zł', 'Skupiona na jednym celu strona kampanii lub usługi. Treść, projekt, formularz, analityka i SEO na start.'],
    ['02', 'Strona firmowa', 'od 5 900 zł', 'Indywidualny serwis do 7 podstron, edytowalne treści, optymalizacja i krótkie szkolenie.'],
    ['03', 'Portfolio', 'od 3 500 zł', 'Miejsce, które dobrze pokazuje realizacje, sposób pracy i prowadzi potencjalnego klienta do kontaktu.'],
    ['04', 'Opieka i rozwój', 'od 390 zł / mies.', 'Aktualizacje, kopie zapasowe, monitoring oraz uzgodnione zmiany po uruchomieniu strony.'],
];
$steps = [
    ['01', 'Rozpoznanie', 'Krótki brief, rozmowa i ustalenie, co strona ma osiągnąć.'],
    ['02', 'Kierunek', 'Struktura, treść i koncepcja wizualna dopasowana do marki.'],
    ['03', 'Projekt', 'Widok kluczowych ekranów i konkretna runda uwag.'],
    ['04', 'Wdrożenie', 'Budowa, wersja mobilna, testy, SEO techniczne i analityka.'],
    ['05', 'Dobry start', 'Publikacja, instrukcja obsługi i możliwość dalszej opieki.'],
];
$brief_status = sanitize_key(wp_unslash($_GET['brief'] ?? ''));
?>
<main id="main">
    <section class="hero wrap" aria-labelledby="hero-title">
        <div class="hero-meta"><span>STUDIO STRON INTERNETOWYCH</span><span>WARSZAWA / ONLINE</span><span>EST. 2026</span></div>
        <div class="hero-grid">
            <div class="hero-copy">
                <p class="kicker"><i></i> STRATEGIA • DESIGN • WORDPRESS</p>
                <h1 id="hero-title">Strony, które<br><em>dobrze wyglądają</em><br>i jeszcze lepiej<br><span>pracują.</span></h1>
            </div>
            <div class="hero-side">
                <div class="availability"><i></i><span>PRZYJMUJĘ PROJEKTY<br>NA <?php echo esc_html(wp_date('F Y')); ?></span></div>
                <p>Projektuję wyraziste i przemyślane strony dla małych firm, usług i marek osobistych. Bez gotowych schematów. Z jasnym celem biznesowym.</p>
                <a class="round-link" href="#portfolio"><span>ZOBACZ<br>REALIZACJE</span><b>↓</b></a>
            </div>
        </div>
        <div class="ticker" aria-label="Zakres usług"><div><span>STRONY FIRMOWE</span><i>✦</i><span>LANDING PAGE</span><i>✦</i><span>PORTFOLIO</span><i>✦</i><span>WORDPRESS</span><i>✦</i><span>SEO TECHNICZNE</span><i>✦</i></div></div>
    </section>

    <section class="manifesto section-pad">
        <div class="wrap manifesto-grid">
            <span class="section-label">01 / DLACZEGO</span>
            <div><h2>Ładna strona to za mało.</h2><p class="lead">Dobra strona porządkuje ofertę, buduje zaufanie i ułatwia klientowi zrobienie kolejnego kroku.</p></div>
            <div class="manifesto-note"><span>MOJE PODEJŚCIE</span><p>Najpierw sens i treść. Potem forma. Na końcu technologia, która nie przeszkadza i daje się łatwo obsługiwać.</p></div>
        </div>
    </section>

    <section id="portfolio" class="portfolio section-pad">
        <div class="wrap">
            <div class="section-heading"><span class="section-label">02 / WYBRANE PRACE</span><h2>Każda marka potrzebuje<br><em>własnego rytmu.</em></h2><p>Tu pojawią się Twoje realizacje. Dodajesz je w panelu WordPress jak zwykłe wpisy.</p></div>
            <div class="project-grid">
                <?php
                $projects = new WP_Query(['post_type' => 'realizacja', 'posts_per_page' => 4]);
                if ($projects->have_posts()) :
                    $i = 0;
                    while ($projects->have_posts()) : $projects->the_post(); $i++;
                        $client = get_post_meta(get_the_ID(), 'klient', true);
                        $scope = get_post_meta(get_the_ID(), 'zakres', true) ?: __('Projekt i wdrożenie', 'zielona-marka'); ?>
                        <article class="project-card project-<?php echo esc_attr((string) $i); ?>">
                            <a href="<?php the_permalink(); ?>">
                                <div class="project-visual"><?php if (has_post_thumbnail()) { the_post_thumbnail('zm-project'); } else { ?><span><?php echo esc_html(sprintf('%02d', $i)); ?></span><?php } ?><b>↗</b></div>
                                <div class="project-info"><span><?php echo esc_html($client ?: 'ZIELONA MARKA'); ?></span><h3><?php the_title(); ?></h3><small><?php echo esc_html($scope); ?></small></div>
                            </a>
                        </article>
                    <?php endwhile; wp_reset_postdata();
                else :
                    $demo = [
                        ['NATURA STUDIO', 'Spokojniej znaczy lepiej', 'STRONA USŁUGOWA', 'moss'],
                        ['FORMA BISTRO', 'Codziennie świeża forma', 'RESTAURACJA', 'coral'],
                        ['DOM DOBRY', 'Miejsce zaczyna się tutaj', 'NIERUCHOMOŚCI', 'blue'],
                    ];
                    foreach ($demo as $i => $item) : ?>
                        <article class="project-card project-<?php echo esc_attr((string) ($i + 1)); ?> is-demo">
                            <div class="project-visual <?php echo esc_attr($item[3]); ?>"><span class="mock-logo"><?php echo esc_html($item[0]); ?></span><strong><?php echo esc_html($item[1]); ?></strong><small>PROJEKT KONCEPCYJNY</small><b>↗</b></div>
                            <div class="project-info"><span>0<?php echo esc_html((string) ($i + 1)); ?></span><h3><?php echo esc_html($item[0]); ?></h3><small><?php echo esc_html($item[2]); ?></small></div>
                        </article>
                    <?php endforeach;
                endif; ?>
            </div>
            <div class="portfolio-tip"><span>+</span><p><b>Portfolio rośnie razem z firmą.</b><br>Każda nowa realizacja automatycznie trafia w ten układ.</p></div>
        </div>
    </section>

    <section id="oferta" class="services section-pad">
        <div class="wrap services-grid">
            <div class="services-intro"><span class="section-label">03 / OFERTA</span><h2>Wybierz dobry<br>punkt startu<span>.</span></h2><p>Ostateczna cena zależy od zakresu, materiałów i integracji. Po krótkim briefie otrzymasz przejrzystą ofertę.</p><a class="arrow-link" href="#kontakt">POPROŚ O WYCENĘ <span>↗</span></a></div>
            <div class="service-list">
                <?php foreach ($services as $service) : ?>
                    <article class="service-item"><span><?php echo esc_html($service[0]); ?></span><div><h3><?php echo esc_html($service[1]); ?></h3><p><?php echo esc_html($service[3]); ?></p></div><strong><?php echo esc_html($service[2]); ?></strong><button type="button" aria-label="<?php echo esc_attr('Pokaż opis: ' . $service[1]); ?>" aria-expanded="false">+</button></article>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <section id="proces" class="process-section section-pad">
        <div class="wrap">
            <div class="process-heading"><span class="section-label">04 / PROCES</span><h2>Bez czarnej skrzynki.</h2><p>Wiesz, na jakim etapie jesteśmy, czego potrzebuję i co wydarzy się dalej.</p></div>
            <div class="process-track">
                <?php foreach ($steps as $step) : ?><article><span><?php echo esc_html($step[0]); ?></span><i></i><h3><?php echo esc_html($step[1]); ?></h3><p><?php echo esc_html($step[2]); ?></p></article><?php endforeach; ?>
            </div>
            <div class="standard"><span>W KAŻDYM PROJEKCIE</span><ul><li>wersja mobilna</li><li>podstawowe SEO</li><li>optymalizacja szybkości</li><li>formularz kontaktowy</li><li>instrukcja obsługi</li></ul></div>
        </div>
    </section>

    <section class="quote-section"><div class="wrap"><span class="quote-mark">“</span><blockquote>Nie projektuję strony<br>„żeby była”. Projektuję ją,<br><em>żeby coś zmieniała.</em></blockquote><span class="signature">ZIELONA MARKA / ZASADA NR 01</span></div></section>

    <section id="kontakt" class="contact section-pad">
        <div class="wrap contact-grid">
            <div class="contact-copy"><span class="section-label">05 / KONTAKT</span><h2>Masz pomysł?<br><em>Zróbmy mu miejsce.</em></h2><p>Napisz kilka zdań o firmie i celu strony. Odpowiem z propozycją kolejnych kroków oraz wstępnym przedziałem ceny.</p><a href="mailto:<?php echo esc_attr(get_theme_mod('zm_email', 'lukasz.staniewicz@gmail.com')); ?>"><?php echo esc_html(get_theme_mod('zm_email', 'lukasz.staniewicz@gmail.com')); ?> ↗</a></div>
            <form class="brief-form" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
                <input type="hidden" name="action" value="zm_send_brief">
                <?php wp_nonce_field('zm_send_brief', 'zm_brief_nonce'); ?>
                <?php if ($brief_status === 'sent') : ?><div class="form-message success" role="status">Dziękuję. Wiadomość została wysłana.</div><?php elseif ($brief_status === 'error') : ?><div class="form-message error" role="alert">Nie udało się wysłać wiadomości. Sprawdź pola lub napisz e-mail.</div><?php endif; ?>
                <div class="field-row"><label><span>01 / IMIĘ</span><input name="name" required autocomplete="name" placeholder="Jak masz na imię?"></label><label><span>02 / E-MAIL</span><input name="email" required type="email" autocomplete="email" placeholder="twoj@email.pl"></label></div>
                <div class="field-row"><label><span>03 / FIRMA</span><input name="company" autocomplete="organization" placeholder="Nazwa firmy"></label><label><span>04 / BUDŻET</span><select name="budget"><option value="">Wybierz przedział</option><option>3–6 tys. zł</option><option>6–10 tys. zł</option><option>10–20 tys. zł</option><option>powyżej 20 tys. zł</option></select></label></div>
                <label><span>05 / O PROJEKCIE</span><textarea name="message" required rows="4" placeholder="Czego potrzebujesz? Jaki jest cel strony?"></textarea></label>
                <label class="consent"><input type="checkbox" required><span>Akceptuję <a href="<?php echo esc_url(get_privacy_policy_url()); ?>">politykę prywatności</a> i kontakt w sprawie zapytania.</span></label>
                <button class="submit-button" type="submit"><span>WYŚLIJ BRIEF</span><b>↗</b></button>
            </form>
        </div>
    </section>
</main>
<?php get_footer(); ?>
