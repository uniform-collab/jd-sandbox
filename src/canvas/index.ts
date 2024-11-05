import './Accordion';
import './AccordionItem';
import './AddToCart';
import './Banner';
import './Breadcrumbs';
import './Button';
import './CallToAction';
import './Card';
import './Countdown';
import './Tabs';
import './Tab';
import './_atoms/Text';
import './_atoms/RichText';
import './_atoms/Hotspot';
import './CardBlock';
import './Carousel';
import './_containers/Container';
import './_containers/Box';
import './_containers/AdvancedContainer';
import './_containers/Grid';
import './_containers/GridItem';
import './ContentBlock';
import './Divider';
import './Feature';
import './FeaturedCallout';
import './Hero';
import './HeroContainer';
import './Image';
import './Table';
import './Modal';
import './_navigation/Footer';
import './_navigation/NavigationSection';
import './_navigation/Header';
import './_navigation/IconLink';
import './_navigation/NavLink';
import './Hotspots';
import './Price';
import './ProductDetails';
import './ProductInfo';
import './ImageGallery';
import './Review';
import './Spacer';
import './Testimonial';
import './Video';
import './EnrichmentSetter';
import './LocaleSwitcher';
import './Page';

import '@/modules/promotion';
import '@/modules/fake-cart';
import '@/modules/segment';
import '@/modules/auth';
import '@/modules/java-drip-new-design';
import '@/modules/search';
import '@/modules/algolia';
import '../canvas/ArticleContent';

import AlgoliaHits from '../modules/algolia/AlgoliaHits';
import SearchEntryResultList from '../modules/search/SearchEntryResultList';
import ProductInfo from '../modules/fake-cart/ProductInfo';
import ShoppingCartIcon from '../modules/fake-cart/ShoppingCartIcon';
import SegmentProfileContent from '../modules/segment/SegmentProfileContent';
import UserProfileContent from '../modules/auth/UserProfileContent';
import OrderHistory from '../modules/auth/OrderHistory';
import ProfileIcon from '../modules/auth/ProfileIconContent';
import { overrideCanvasComponents } from '../modules/java-drip-new-design/overrideCanvasComponents';

// This is override of fake-commerce ProductInfo component to apply custom styling
overrideCanvasComponents({
  type: 'productInfo',
  component: ProductInfo,
});

// This is override of fake-commerce CartIcon component to apply custom styling
overrideCanvasComponents({
  type: 'shoppingCartIcon',
  component: ShoppingCartIcon,
});

// This is override of fake-commerce ProfileIcon component to apply custom styling
overrideCanvasComponents({
  type: 'profileIcon',
  component: ProfileIcon,
});

// This is override of fake-commerce SegmentProfileContent component to apply custom styling
overrideCanvasComponents({
  type: 'segmentProfileContent',
  component: SegmentProfileContent,
});

// This is override of fake-commerce UserProfileContent component to apply custom styling
overrideCanvasComponents({
  type: 'userProfileContent',
  component: UserProfileContent,
});

// This is override of fake-commerce OrderHistory component to apply custom styling
overrideCanvasComponents({
  type: 'orderHistory',
  component: OrderHistory,
});

// This is override of Search Entry Result List component to apply custom styling
overrideCanvasComponents({
  type: 'searchEntryResultList',
  component: SearchEntryResultList,
});

// This is override of algolia AlgoliaHits component to apply custom styling
overrideCanvasComponents({
  type: 'algolia-hits',
  component: AlgoliaHits,
});

export { default as Card } from './Card';
export { CardVariants } from './Card';
