<footer class="site-footer">
    <div class="wrap footer-grid">
        <div><a class="footer-mark" href="<?php echo esc_url(home_url('/')); ?>">ZIELONA<br>MARKA<span>.</span></a><p>Projekt, treść i technologia<br>pracujące na Twój biznes.</p></div>
        <div><span class="micro">NA SKRÓTY</span><a href="<?php echo esc_url(home_url('/#portfolio')); ?>">Portfolio</a><a href="<?php echo esc_url(home_url('/#oferta')); ?>">Oferta</a><a href="<?php echo esc_url(home_url('/#kontakt')); ?>">Kontakt</a></div>
        <div><span class="micro">KONTAKT</span><a href="mailto:<?php echo esc_attr(get_theme_mod('zm_email', 'lukasz.staniewicz@gmail.com')); ?>"><?php echo esc_html(get_theme_mod('zm_email', 'lukasz.staniewicz@gmail.com')); ?></a><a href="tel:<?php echo esc_attr(preg_replace('/\s+/', '', get_theme_mod('zm_phone', '+48 000 000 000'))); ?>"><?php echo esc_html(get_theme_mod('zm_phone', '+48 000 000 000')); ?></a></div>
    </div>
    <div class="wrap footer-bottom"><span>© <?php echo esc_html(wp_date('Y')); ?> ZIELONA MARKA</span><a href="<?php echo esc_url(get_privacy_policy_url()); ?>">Polityka prywatności</a><span>WARSZAWA / ONLINE</span></div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
