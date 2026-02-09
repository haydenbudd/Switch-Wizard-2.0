import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', logger(console.log));
app.use('*', cors());

// Version tracking to prevent re-initialization on redeploys
const DB_VERSION = 'v1.7.2'; // Incremented to force re-seed with new connection types

// Helper function to generate a large product catalog
function generateLargeCatalog() {
  try {
    const products: any[] = [];
    let skuCounter = 1000;

    // Base Images
    const images = {
      hercules: 'https://linemaster.com/wp-content/uploads/2025/04/hercules-full-shield.png',
      atlas: 'https://linemaster.com/wp-content/uploads/2025/04/atlas.png',
      clipper: 'https://linemaster.com/wp-content/uploads/2025/04/clipper_duo.png',
      classic: 'https://linemaster.com/wp-content/uploads/2025/04/classic-iv.png',
      dolphin: 'https://linemaster.com/wp-content/uploads/2025/04/dolphin-2.png',
      gem: 'https://linemaster.com/wp-content/uploads/2025/04/gem.png',
      wireless: 'https://linemaster.com/wp-content/uploads/2025/04/rf-hercules.png',
      pneumatic: 'https://linemaster.com/wp-content/uploads/2025/03/airval-hercules-duo_optimized.png',
      general: 'https://linemaster.com/wp-content/uploads/2025/03/air_seal.png',
      varior: 'https://linemaster.com/wp-content/uploads/2025/04/varior-potentiometer.png',
    };

    // 1. HERCULES SERIES (Heavy Duty, Industrial)
    // Hercules uses screw terminals inside the housing
    const herculesActions = ['momentary', 'maintained'];
    const herculesShields = [[], ['shield'], ['shield', 'oversized-shield']];
    // Hercules typically user-wired (screw terminals), but can be pre-wired custom. 
    // Standardizing on screw-terminal for the catalog.
    const herculesConn = 'screw-terminal'; 
    const herculesColors = ['Orange', 'Black'];
    
    herculesActions.forEach(action => {
      herculesShields.forEach(features => {
        herculesColors.forEach(color => {
          products.push({
            id: `hercules-${skuCounter++}`,
            series: 'Hercules',
            technology: 'electrical',
            duty: 'heavy',
            ip: features.includes('shield') ? 'IP56' : 'IP54',
            actions: [action],
            material: 'Cast Iron',
            description: `Hercules Heavy Duty - ${color}, ${action}, ${features.includes('shield') ? 'Shielded' : 'No Shield'}.`,
            applications: ['industrial', 'automotive', 'woodworking'],
            features: [...features],
            connection: herculesConn,
            certifications: 'UL, CSA, CE, IEC',
            flagship: features.includes('shield') && action === 'momentary' && color === 'Orange',
            image: images.hercules,
            link: 'https://linemaster.com/product/167/hercules-full-shield/',
          });
        });
      });
    });

    // 2. CLIPPER SERIES
    // Clipper uses screw terminals
    const clipperTypes = ['Single', 'Twin'];
    const clipperActions = ['momentary', 'maintained'];
    const clipperShields = [[], ['shield']];
    const clipperConn = 'screw-terminal';
    
    clipperTypes.forEach(type => {
      clipperActions.forEach(action => {
        clipperShields.forEach(baseFeatures => {
          const features = [...baseFeatures];
          if (type === 'Twin') features.push('twin');
          
          products.push({
            id: `clipper-${skuCounter++}`,
            series: 'Clipper',
            technology: 'electrical',
            duty: 'medium',
            ip: 'IP20',
            actions: [action],
            material: 'Cast Iron',
            description: `Clipper ${type} - ${action}, ${features.includes('shield') ? 'Shielded' : 'Open'}.`,
            applications: ['industrial', 'woodworking', 'general'],
            features: features,
            connection: clipperConn,
            certifications: 'UL, CSA',
            flagship: type === 'Single' && action === 'momentary' && !features.includes('shield'),
            image: images.clipper,
            link: 'https://linemaster.com/product/115/clipper-single-momentary/',
          });
        });
      });
    });

    // 3. AQUILINE & MEDICAL SERIES (Dolphin, etc.)
    // These are waterproof, pre-wired
    const medicalSeries = ['Aquiline', 'Medical Grade V'];
    const medicalPedals = [1, 2, 3];
    const medicalConn = 'pre-wired';
    const medicalColors = ['Gray', 'Black'];
    
    medicalSeries.forEach(series => {
      medicalPedals.forEach(count => {
        medicalColors.forEach(color => {
             const allowedActions = count === 1 ? ['momentary', 'maintained'] : ['momentary'];
             allowedActions.forEach(action => {
                 products.push({
                  id: `med-${series.toLowerCase().replace(/\s+/g, '-')}-${skuCounter++}`,
                  series: series,
                  technology: 'electrical',
                  duty: 'light',
                  ip: 'IP68', // Corrected to IP68
                  actions: [action],
                  material: 'Polymeric',
                  description: `${series} Waterproof - ${count} Pedal(s), ${color}, ${action}.`,
                  applications: ['medical', 'tattoo', 'dental'],
                  features: count > 1 ? ['multi_pedal'] : [],
                  connection: medicalConn, 
                  configuration: 'aero',
                  pedal_count: count,
                  certifications: 'IEC 60601-1, UL, CE',
                  flagship: count === 1 && action === 'momentary' && color === 'Gray',
                  image: images.dolphin,
                  link: 'https://linemaster.com/product/129/dolphin/',
                });
            });
          });
      });
    });

    // 4. ATLAS & NAUTILUS
    // Screw terminals
    const heavySealed = ['Atlas', 'Nautilus'];
    heavySealed.forEach(series => {
        ['momentary'].forEach(action => {
          ['shield', 'no-shield'].forEach(shield => {
               products.push({
                  id: `${series.toLowerCase()}-${skuCounter++}`,
                  series: series,
                  technology: 'electrical',
                  duty: 'heavy',
                  ip: 'IP68',
                  actions: [action],
                  material: series === 'Nautilus' ? 'Cast Bronze' : 'Cast Aluminum',
                  description: `${series} Sealed - ${action}, ${shield === 'shield' ? 'Shielded' : 'No Shield'}.`,
                  applications: ['industrial', 'automotive', 'marine'],
                  features: shield === 'shield' ? ['shield'] : [],
                  connection: 'screw-terminal',
                  certifications: 'UL, CSA, CE',
                  flagship: false,
                  image: images.atlas,
                  link: 'https://linemaster.com/product/77/atlas-full-shield/',
              });
          });
        });
    });

    // 5. WIRELESS SERIES
    ['Hercules', 'Clipper', 'Aquiline'].forEach(base => {
      ['momentary'].forEach(action => {
         ['Single', 'Twin'].forEach(type => {
            if (base === 'Hercules' && type === 'Twin') return;
            products.push({
              id: `wireless-${base.toLowerCase()}-${skuCounter++}`,
              series: `RF Wireless ${base}`,
              technology: 'wireless',
              duty: base === 'Hercules' ? 'heavy' : (base === 'Clipper' ? 'medium' : 'light'),
              ip: base === 'Aquiline' ? 'IP68' : 'IP20',
              actions: [action],
              material: base === 'Hercules' ? 'Cast Iron' : (base === 'Clipper' ? 'Cast Iron' : 'Polymeric'),
              description: `Wireless ${base} - ${type}, ${action}.`,
              applications: ['industrial', 'medical', 'general'],
              features: base === 'Hercules' ? ['shield'] : [],
              configuration: base === 'Aquiline' ? 'aero' : 'custom',
              pedal_count: type === 'Twin' ? 2 : 1,
              certifications: 'FCC, UL, IEC',
              flagship: base === 'Hercules',
              image: images.wireless,
              link: 'https://linemaster.com/product/475/radio-frequency-wireless-hercules/',
            });
         });
      });
    });

    // 6. PNEUMATIC (Air) SERIES
    ['Hercules', 'Clipper', 'Treadlite'].forEach(base => {
      ['momentary'].forEach(action => {
         products.push({
              id: `pneumatic-${base.toLowerCase()}-${skuCounter++}`,
              series: `Airval ${base}`,
              technology: 'pneumatic', // Keeping pneumatic, mapped correctly in App.tsx now
              duty: base === 'Hercules' ? 'heavy' : 'medium',
              ip: 'IP20',
              actions: [action],
              material: base === 'Hercules' ? 'Cast Iron' : 'Formed Steel',
              description: `Pneumatic ${base} - ${action}.`,
              applications: ['industrial', 'automotive', 'hazardous'],
              features: base === 'Hercules' ? ['shield'] : [],
              certifications: '',
              flagship: false,
              image: images.pneumatic,
              link: 'https://linemaster.com/product/17/airval-hercules-full-shield/',
         });
      });
    });
    
    // 7. COMPACT / GENERAL PURPOSE
    const lightDutyModels = [
        { name: 'Executive', material: 'Cast Zinc', config: 'custom', conn: 'pre-wired', duty: 'light' },
        { name: 'Treadlite II', material: 'Formed Steel', config: 'custom', conn: 'pre-wired', duty: 'light' },
        { name: 'Gem-V', material: 'Cast Zinc', config: 'round', conn: 'pre-wired', duty: 'light' },
        { name: 'Dolphin', material: 'Polymeric', config: 'aero', conn: 'pre-wired', duty: 'light' },
        // Air Seal is Electro-Pneumatic (Electrical switch actuated by air bellows remotely)
        { name: 'Air-Seal', material: 'Polymeric', config: 'custom', conn: 'pre-wired', duty: 'light', technology: 'electrical' },
        // Varior is Medium duty
        { name: 'Varior', material: 'Cast Zinc', config: 'round', conn: 'pre-wired', duty: 'medium' }
    ];
    
    lightDutyModels.forEach(model => {
        ['momentary'].forEach(action => {
            products.push({
              id: `general-${model.name.toLowerCase().replace(/\s+/g, '-')}-${skuCounter++}`,
              series: model.name,
              technology: model.technology || 'electrical',
              duty: model.duty,
              ip: 'IP20',
              actions: [action],
              material: model.material,
              description: `${model.name} - ${model.duty} duty, ${action}.`,
              applications: ['general', 'office', 'medical'],
              features: [],
              connection: model.conn,
              configuration: model.config === 'round' ? 'custom' : 'aero',
              pedal_count: 1,
              certifications: 'UL, CSA',
              flagship: false,
              image: model.name === 'Dolphin' ? images.dolphin : (model.name === 'Varior' ? images.varior : images.gem),
              link: 'https://linemaster.com/product/162/gem-v/',
            });
        });
    });

    // 8. CLASSIC IV (Updated)
    // Quick-connect terminals
    ['momentary', 'variable'].forEach(action => {
        ['shield', 'no-shield'].forEach(shield => {
            products.push({
                id: `classic-iv-${skuCounter++}`,
                series: 'Classic IV',
                technology: 'electrical',
                duty: 'medium',
                ip: 'IP56', // NEMA 2, 4, 13
                actions: [action],
                material: 'Cast Aluminum',
                description: `Classic IV - ${action}, ${shield === 'shield' ? 'Shielded' : 'No Shield'}.`,
                applications: ['industrial', 'medical', 'general'],
                features: shield === 'shield' ? ['shield', 'twin'] : ['twin'],
                connection: 'quick-connect',
                certifications: 'UL, CSA, CE',
                flagship: action === 'variable' && shield === 'shield',
                image: images.classic,
                link: 'https://linemaster.com/product/43/classic-iv-linear/',
            });
        });
    });

    // 9. EXPLOSION PROOF
    ['momentary'].forEach(action => {
        ['Single'].forEach(type => {
            products.push({
              id: `hazloc-${skuCounter++}`,
              series: 'Explosion Proof',
              technology: 'electrical',
              duty: 'heavy',
              ip: 'IP68',
              actions: [action],
              material: 'Cast Aluminum',
              description: `Hazardous Location ${type} - ${action}. Class I Div I.`,
              applications: ['industrial', 'oil-gas', 'mining'],
              features: ['shield'],
              connection: 'screw-terminal', // Flying leads or screw terminals usually
              certifications: 'UL, CSA, ATEX, IECEx',
              flagship: false,
              image: images.atlas,
              link: 'https://linemaster.com/product/77/atlas-full-shield/',
            });
        });
    });

    console.log(`Generated ${products.length} total products.`);
    return products;
  } catch (error) {
    console.error("Critical error generating catalog:", error);
    return []; // Return empty to avoid crashing
  }
}

// Initialize data on first run ONLY
// This checks for both the existence of data AND a version flag
// If data exists, it will NEVER be overwritten, even on redeploy
async function initializeData() {
  try {
    console.log('Checking if data initialization is needed...');
    
    // Check if we've already initialized (version flag prevents re-init on redeploy)
    const dbVersion = await kv.get('db_version');
    if (dbVersion === DB_VERSION) {
      console.log(`Database already initialized (version ${dbVersion}). Skipping initialization.`);
      return;
    }
    
    console.log(`Database version mismatch or not found (Current: ${dbVersion}, Target: ${DB_VERSION}). Re-seeding data...`);
    
    // Generate and set products
    const products = generateLargeCatalog();
    await kv.set('products', products);
    console.log(`Initialized ${products.length} products`);

    // Always reset options on version change to ensure new categories exist
    console.log('Initializing options...');
    const defaultOptions = [
    // Applications
    { id: 'industrial', category: 'application', label: 'Industrial & Manufacturing', icon: 'Factory', description: 'Heavy machinery, CNC, assembly', sortOrder: 1 },
    { id: 'medical', category: 'application', label: 'Medical & Healthcare', icon: 'Heart', description: 'Surgical, diagnostic, patient care', isMedical: true, sortOrder: 2 },
    { id: 'automotive', category: 'application', label: 'Automotive & Repair', icon: 'Car', description: 'Lifts, paint booths, tire changers', sortOrder: 3 },
    { id: 'woodworking', category: 'application', label: 'Woodworking', icon: 'Hammer', description: 'Saws, lathes, routers', sortOrder: 4 },
    { id: 'tattoo', category: 'application', label: 'Tattoo & Body Art', icon: 'Palette', description: 'Precision control for artists', sortOrder: 5 },
    { id: 'general', category: 'application', label: 'General / Other', icon: 'Coffee', description: 'Office, consumer, specialty', sortOrder: 6 },
    
    // Technologies
    { id: 'electrical', category: 'technology', label: 'Electrical', icon: 'Zap', description: 'Standard wired connection.', availableFor: ['industrial', 'automotive', 'woodworking', 'tattoo', 'general'], sortOrder: 1 },
    { id: 'pneumatic', category: 'technology', label: 'Pneumatic (Air)', icon: 'Wind', description: 'Uses compressed air.', availableFor: ['industrial', 'automotive', 'woodworking', 'general'], sortOrder: 2 },
    { id: 'wireless', category: 'technology', label: 'RF Wireless', icon: 'Radio', description: 'Cord-free operation.', availableFor: ['industrial', 'automotive', 'general'], sortOrder: 3 },
    
    // Actions
    { id: 'momentary', category: 'action', label: 'Momentary', icon: 'CircleDot', description: 'Active while pressed.', availableFor: ['electrical', 'pneumatic', 'wireless'], sortOrder: 1 },
    { id: 'maintained', category: 'action', label: 'Maintained', icon: 'ToggleLeft', description: 'Press ON, press again OFF.', availableFor: ['electrical', 'pneumatic'], sortOrder: 2 },
    { id: 'variable', category: 'action', label: 'Variable Speed', icon: 'Gauge', description: 'Speed varies with pressure.', availableFor: ['electrical', 'pneumatic'], sortOrder: 3 },
    
    // Environments
    { id: 'dry', category: 'environment', label: 'Dry / Indoor', description: 'IP20 sufficient.', icon: 'Home', sortOrder: 1 },
    { id: 'damp', category: 'environment', label: 'Damp / Splash', description: 'IP56 recommended.', icon: 'CloudRain', sortOrder: 2 },
    { id: 'wet', category: 'environment', label: 'Wet / Washdown', description: 'IP68 required.', icon: 'Droplets', sortOrder: 3 },
    
    // Connector Types (Updated)
    { id: 'screw-terminal', category: 'connector', label: 'Screw Terminals', description: 'Internal terminals for user wiring.', icon: 'SquareTerminal', availableFor: ['electrical'], sortOrder: 1 },
    { id: 'quick-connect', category: 'connector', label: 'Quick Connect', description: 'Push-on blade terminals.', icon: 'Zap', availableFor: ['electrical'], sortOrder: 2 },
    { id: 'pre-wired', category: 'connector', label: 'Pre-Wired', description: 'Comes with cord/plug attached.', icon: 'Plug', availableFor: ['electrical'], sortOrder: 3 },
    
    // Certifications
    { id: 'UL', category: 'certification', label: 'UL Listed', description: 'Underwriters Laboratories', sortOrder: 1 },
    { id: 'CSA', category: 'certification', label: 'CSA Certified', description: 'Canadian Standards Association', sortOrder: 2 },
    { id: 'CE', category: 'certification', label: 'CE Marked', description: 'European Conformity', sortOrder: 3 },
    { id: 'IEC', category: 'certification', label: 'IEC 60601-1', description: 'Medical Electrical Equipment', sortOrder: 4 },
    { id: 'FCC', category: 'certification', label: 'FCC Approved', description: 'Federal Communications Commission', sortOrder: 5 },
    
    // Features
    { id: 'feature-shield', category: 'feature', label: 'Safety Guard/Shield', description: 'Prevents accidental activation.', sortOrder: 1 },
    { id: 'feature-multi_stage', category: 'feature', label: 'Multi-Stage', description: '2 or 3 actuation points.', sortOrder: 2 },
    { id: 'feature-twin', category: 'feature', label: 'Twin Pedal', description: 'Two independent pedals.', sortOrder: 3 },
    { id: 'feature-custom-cable', category: 'feature', label: 'Custom Cable Length', description: 'Non-standard cord length.', hideFor: ['wireless', 'pneumatic'], sortOrder: 4 },
    { id: 'feature-custom-connector', category: 'feature', label: 'Custom Connector', description: 'Specific plug type.', sortOrder: 5 },
    
    // Console Styles (Medical)
    { id: 'aero', category: 'console_style', label: 'Aero Channel', description: 'Low-profile, streamlined design.', sortOrder: 1 },
    { id: 'custom', category: 'console_style', label: 'Custom Design', description: 'Unique housing tailored to your needs.', sortOrder: 2 },
    
    // Pedal Counts (Medical)
    { id: '1', category: 'pedal_count', label: 'Single', description: 'One function', sortOrder: 1 },
    { id: '2', category: 'pedal_count', label: 'Dual', description: 'Two functions', sortOrder: 2 },
    { id: '3', category: 'pedal_count', label: 'Triple', description: 'Three functions', sortOrder: 3 },
    { id: '4+', category: 'pedal_count', label: 'Multi', description: '4+ controls', sortOrder: 4 },
    
    // Medical Technical Features
    { id: 'wireless_medical', category: 'medical_feature', label: 'RF Wireless', description: 'No cords in the OR.', sortOrder: 1 },
    { id: 'linear', category: 'medical_feature', label: 'Variable Speed', description: 'Proportional control.', sortOrder: 2 },
    { id: 'sealed', category: 'medical_feature', label: 'Sealed / Washdown', description: 'IP68 for sterilization.', sortOrder: 3 },
    
    // Accessories (Medical)
    { id: 'toe_loops', category: 'accessory', label: 'Toe Loops', description: 'Secure foot positioning.', sortOrder: 1 },
    { id: 'guards', category: 'accessory', label: 'Pedal Guards', description: 'Prevent accidental activation.', sortOrder: 2 },
    { id: 'labels', category: 'accessory', label: 'Custom Labels/Marking', description: 'Branding or identification.', sortOrder: 3 },
    { id: 'color', category: 'accessory', label: 'Custom Color', description: 'Match your device.', sortOrder: 4 },
    ];
    
    await kv.set('options', defaultOptions);
    console.log('Initialized options data');

    // Set the version flag to prevent re-initialization on redeploy
    await kv.set('db_version', DB_VERSION);
    console.log(`Set database version to ${DB_VERSION}`);
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Initialize data on startup
initializeData().catch(console.error);

// Force server update log
console.log('Server starting... v1.7.2 - Updated connection types and product data');

// GET all products
app.get('/make-server-963c7b83/products', async (c) => {
  try {
    console.log('Fetching products from KV store...');
    const products = await kv.get('products') || [];
    console.log(`Successfully fetched ${products.length} products`);
    return c.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ error: 'Failed to fetch products', details: error instanceof Error ? error.message : String(error) }, 500);
  }
});

// GET single product by ID
app.get('/make-server-963c7b83/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const products = await kv.get('products') || [];
    const product = products.find((p: any) => p.id === id);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

// POST create or update product (single or bulk)
app.post('/make-server-963c7b83/products', async (c) => {
  try {
    const body = await c.req.json();
    // Handle special "delete_all" action
    if (!Array.isArray(body) && body.action === 'delete_all') {
      console.log('⚠️ PROCESSING DELETE ALL REQUEST...');
      await kv.set('products', []);
      console.log('✅ All products deleted via POST endpoint');
      return c.json({ success: true, message: 'All products have been deleted' });
    }

    const products = await kv.get('products') || [];
    const productMap = new Map(products.map((p: any) => [p.id, p]));

    // Handle array (bulk)
    if (Array.isArray(body)) {
      console.log(`Processing bulk import for ${body.length} products via POST /products...`);
      for (const product of body) {
        if (!product.id) continue;
        productMap.set(product.id, { ...productMap.get(product.id), ...product });
      }
      
      const updatedProducts = Array.from(productMap.values());
      await kv.set('products', updatedProducts);
      
      console.log(`Bulk import complete. Total products: ${updatedProducts.length}`);
      return c.json({ success: true, count: updatedProducts.length });
    } 
    
    // Handle single object
    else {
      productMap.set(body.id, { ...productMap.get(body.id), ...body });
      const updatedProducts = Array.from(productMap.values());
      await kv.set('products', updatedProducts);
      const product = productMap.get(body.id);
      return c.json({ product });
    }
  } catch (error) {
    console.error('Error upserting product(s):', error);
    return c.json({ error: 'Failed to save product(s)' }, 500);
  }
});

// DELETE ALL products (Collection)
app.delete('/make-server-963c7b83/products', async (c) => {
  try {
    console.log('⚠️ DELETING ALL PRODUCTS via DELETE /products...');
    await kv.set('products', []);
    console.log('✅ All products deleted');
    return c.json({ success: true, message: 'All products have been deleted' });
  } catch (error) {
    console.error('Error deleting all products:', error);
    return c.json({ error: 'Failed to delete all products' }, 500);
  }
});

// DELETE product
app.delete('/make-server-963c7b83/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const products = await kv.get('products') || [];
    const filtered = products.filter((p: any) => p.id !== id);
    
    await kv.set('products', filtered);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// RESET/DELETE ALL products (Action) - Deprecated, use DELETE /products
app.post('/make-server-963c7b83/reset-products', async (c) => {
  try {
    console.log('⚠️ DELETING ALL PRODUCTS (RESET)...');
    await kv.set('products', []);
    return c.json({ success: true, message: 'All products have been deleted' });
  } catch (error) {
    return c.json({ error: 'Failed' }, 500);
  }
});

// FORCE DELETE ALL (GET) - Emergency fallback
app.get('/make-server-963c7b83/nuke-everything', async (c) => {
  try {
    console.log('☢️ NUKING ALL DATA...');
    await kv.set('products', []);
    return c.json({ success: true, message: 'Nuked successfully' });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// GET all options
app.get('/make-server-963c7b83/options', async (c) => {
  try {
    const options = await kv.get('options') || [];
    return c.json({ options });
  } catch (error) {
    console.error('Error fetching options:', error);
    return c.json({ error: 'Failed to fetch options' }, 500);
  }
});

// GET options by category
app.get('/make-server-963c7b83/options/:category', async (c) => {
  try {
    const category = c.req.param('category');
    const allOptions = await kv.get('options') || [];
    const options = allOptions.filter((o: any) => o.category === category);
    
    return c.json({ options });
  } catch (error) {
    console.error('Error fetching options:', error);
    return c.json({ error: 'Failed to fetch options' }, 500);
  }
});

// POST create or update option
app.post('/make-server-963c7b83/options', async (c) => {
  try {
    const body = await c.req.json();
    const options = await kv.get('options') || [];
    
    const existingIndex = options.findIndex((o: any) => o.id === body.id);
    if (existingIndex >= 0) {
      options[existingIndex] = { ...options[existingIndex], ...body };
    } else {
      options.push(body);
    }
    
    await kv.set('options', options);
    const option = existingIndex >= 0 ? options[existingIndex] : body;
    
    return c.json({ option });
  } catch (error) {
    console.error('Error upserting option:', error);
    return c.json({ error: 'Failed to save option' }, 500);
  }
});

// DELETE option
app.delete('/make-server-963c7b83/options/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const options = await kv.get('options') || [];
    const filtered = options.filter((o: any) => o.id !== id);
    
    await kv.set('options', filtered);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting option:', error);
    return c.json({ error: 'Failed to delete option' }, 500);
  }
});

// Health check
app.get('/make-server-963c7b83/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Image Proxy to bypass CORS/CSP restrictions
app.get('/make-server-963c7b83/image-proxy', async (c) => {
  const url = c.req.query('url');
  if (!url) {
    return c.json({ error: 'Missing url parameter' }, 400);
  }

  try {
    const targetUrl = new URL(url);
    // Security: Only allow linemaster.com domains
    if (!targetUrl.hostname.endsWith('linemaster.com')) {
      return c.json({ error: 'Only linemaster.com images allowed' }, 403);
    }

    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Linemaster-Product-Finder/1.0',
        'Accept': 'image/*',
      },
    });
    
    if (!response.ok) {
      return c.json({ error: `Image fetch failed: ${response.status}` }, response.status as any);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const body = await response.arrayBuffer();

    // Set headers
    return new Response(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return c.json({ error: 'Failed to proxy image' }, 500);
  }
});

Deno.serve(app.fetch);