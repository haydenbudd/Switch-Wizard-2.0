// Easter-egg "Switch Wizard" ASCII companion. Loaded lazily (the ~3KB art
// string stays out of the main bundle) — see the lazy() import in
// StandardSteps.tsx. Default export required by React.lazy.
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getPortalContainer } from '@/app/utils/portalContainer';

const WIZARD_ASCII = `\
                                            ####
                                          #######
                                        ##########
                                       ############
                                      ####### ######
                                     ######    ######
                                    ######      ######
                                   ######        ######
                                  ######          ######
                                 ######            ######
                                ######              ######
                               ######                ######
                              #######                  #######
                             #######                    #######
                        #############################################
                   ####################################################### ######
                 ########################################################### ############
            ##################                                               ###############
          ##############           ####################################           ##############
        ###########               ######################################               ###########
      ########                   ######################################                   ########
      ######                    ######   #######        #######   ######                    ######
       #######                ######### ###########    ########### #########                #######
         #########            ########## ############   ###########  #########            #########
           ###########       ##########   ###   #### ## ####   ###   ##########       ###########
              ##########################   ######### #### #########   ##########################
                 ################### #   ############################   # ###################
                    ##############   ################################   #################
                      ###############      ########      ###############    ###########
                        ###########        ########        ###########     #############
                          #########        ##########        #########     ####### #######
                       ###########        ##############        ##################   ######
                      ##########        ########  ########        #########################
           ###               ######################      ######################   #############
           #####                ##################          ##################       #########
            ######                    ##########                ##########           ###########
            ######                     ######                       #####            ###########
             ######                    #######                     ######            ###########
             ######                   ########                     #######              #####
              ######                  ##########                  ########              #####
              ######                  ############               #########              #####
               ######                ###############            ###########             #####
               ######              ########  #########          #############           #####
                ######           ##########     #######      ####### ##########         #####
                ######    #  #############        #####     ######    #############  #  #####
               ######## ##################        #####  ########     ########################
              #################### ######        #############       ###### ##################
             ###############      #####         ###########          #####      ##############
             ##############     ######        ##########            ######     ##############
             ##############    #######        #########             #######    #############
                 #####################              ####              #####################
                    # ################              ####              #####################
                      ################              ####              #####################
                       #######  ######              ####              ######  ####### #####
                               ######               ####               ######         #####
                               ######               ####               ######         #####
                               ######               ####               ######         #####
                              ######                ####                ######        #####
                              ######                ####                ######        #####
                              ######                 ##                 ######        #####
                             ######                  ##                  ######       #####
                             ######                 ####                 ######       #####
                             ######                 ####                 ######       #####
                             #####                  ####                  #####       #####
                            ######                  ####                  ######      #####
                            ######                  ####                  ######      #####
                            ####################################################      #####
                           ######################################################     #####
                           ######################################################     #####`;

interface WizardCompanionProps {
  visible: boolean;
  onDismiss: () => void;
}

// Companion stays mounted once lazily loaded; `visible` gates AnimatePresence
// so the slide-out exit animation still plays on dismiss.
export default function WizardCompanion({ visible, onDismiss }: WizardCompanionProps) {
  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="hidden md:block"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99999,
          }}
          onClick={onDismiss}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); onDismiss(); } }}
          role="button"
          tabIndex={0}
          aria-label="Dismiss Switch Wizard companion"
        >
          <div
            aria-hidden="true"
            style={{
              padding: '8px',
              userSelect: 'none' as const,
            }}
          >
            {/* Speech bubble above wizard's head */}
            <div style={{
              position: 'relative',
              background: 'var(--card, rgba(255,255,255,0.72))',
              border: '1px solid var(--border, rgba(15,23,42,0.08))',
              borderRadius: '12px',
              padding: '6px 12px',
              marginBottom: '6px',
              maxWidth: '140px',
              marginLeft: 'auto',
              marginRight: 'auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <p style={{
                textAlign: 'center',
                fontSize: '9px',
                color: 'var(--foreground, #0f172a)',
                fontStyle: 'italic',
                letterSpacing: '0.03em',
                margin: 0,
                lineHeight: 1.4,
              }}>
                The Switch Wizard is with you
              </p>
              {/* Speech bubble tail */}
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid var(--card, rgba(255,255,255,0.72))',
              }} />
            </div>
            <pre
              style={{
                fontSize: '2.875px',
                lineHeight: 1.15,
                fontFamily: 'monospace',
                color: 'var(--wizard-color, #0c2461)',
                whiteSpace: 'pre',
                margin: 0,
                filter: 'drop-shadow(0 2px 8px rgba(59,130,246,0.25))',
              }}
            >
{WIZARD_ASCII}
            </pre>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    getPortalContainer()
  );
}
