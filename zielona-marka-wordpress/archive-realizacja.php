<?php get_header(); ?>
<main id="main" class="content-page wrap"><header class="page-heading"><span class="kicker">ZIELONA MARKA / PORTFOLIO</span><h1>Realizacje</h1><p>Wybrane strony, które łączą charakter marki z konkretnym celem.</p></header><div class="posts-grid">
<?php if (have_posts()) : while (have_posts()) : the_post(); ?><article class="post-card"><?php if (has_post_thumbnail()) : ?><a href="<?php the_permalink(); ?>"><?php the_post_thumbnail('zm-project'); ?></a><?php endif; ?><span class="micro"><?php echo esc_html(get_post_meta(get_the_ID(), 'zakres', true) ?: 'PROJEKT I WDROŻENIE'); ?></span><h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2><p><?php echo esc_html(get_the_excerpt()); ?></p><a class="text-link" href="<?php the_permalink(); ?>">Zobacz projekt ↗</a></article><?php endwhile; endif; ?>
</div><?php the_posts_pagination(); ?></main>
<?php get_footer(); ?>
