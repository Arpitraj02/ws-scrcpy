import { ToolBox } from '../../toolbox/ToolBox';
import KeyEvent from '../android/KeyEvent';
import SvgImage from '../../ui/SvgImage';
import { KeyCodeControlMessage } from '../../controlMessage/KeyCodeControlMessage';
import { ToolBoxButton } from '../../toolbox/ToolBoxButton';
import { ToolBoxElement } from '../../toolbox/ToolBoxElement';
import { ToolBoxCheckbox } from '../../toolbox/ToolBoxCheckbox';
import { StreamClientScrcpy } from '../client/StreamClientScrcpy';
import { BasePlayer } from '../../player/BasePlayer';
import { CommandControlMessage } from '../../controlMessage/CommandControlMessage';
import { ControlMessage } from '../../controlMessage/ControlMessage';

const BUTTONS = [
    {
        title: 'Power',
        code: KeyEvent.KEYCODE_POWER,
        icon: SvgImage.Icon.POWER,
    },
    {
        title: 'Volume up',
        code: KeyEvent.KEYCODE_VOLUME_UP,
        icon: SvgImage.Icon.VOLUME_UP,
    },
    {
        title: 'Volume down',
        code: KeyEvent.KEYCODE_VOLUME_DOWN,
        icon: SvgImage.Icon.VOLUME_DOWN,
    },
    {
        title: 'Back',
        code: KeyEvent.KEYCODE_BACK,
        icon: SvgImage.Icon.BACK,
    },
    {
        title: 'Home',
        code: KeyEvent.KEYCODE_HOME,
        icon: SvgImage.Icon.HOME,
    },
    {
        title: 'Overview',
        code: KeyEvent.KEYCODE_APP_SWITCH,
        icon: SvgImage.Icon.OVERVIEW,
    },
];

export class GoogToolBox extends ToolBox {
    protected constructor(list: ToolBoxElement<any>[]) {
        super(list);
    }

    public static createToolBox(
        udid: string,
        player: BasePlayer,
        client: StreamClientScrcpy,
        moreBox?: HTMLElement,
    ): GoogToolBox {
        const playerName = player.getName();
        const list = BUTTONS.slice();
        const handler = <K extends keyof HTMLElementEventMap, T extends HTMLElement>(
            type: K,
            element: ToolBoxElement<T>,
        ) => {
            if (!element.optional?.code) {
                return;
            }
            const { code } = element.optional;
            const action = type === 'mousedown' ? KeyEvent.ACTION_DOWN : KeyEvent.ACTION_UP;
            const event = new KeyCodeControlMessage(action, code, 0, 0);
            client.sendMessage(event);
        };
        const elements: ToolBoxElement<any>[] = list.map((item) => {
            const button = new ToolBoxButton(item.title, item.icon, {
                code: item.code,
            });
            button.addEventListener('mousedown', handler);
            button.addEventListener('mouseup', handler);
            return button;
        });

        // Volume mute button
        const mute = new ToolBoxButton('Mute', SvgImage.Icon.VOLUME_MUTE);
        mute.addEventListener('click', () => {
            client.sendMessage(new KeyCodeControlMessage(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_VOLUME_MUTE, 0, 0));
            client.sendMessage(new KeyCodeControlMessage(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_VOLUME_MUTE, 0, 0));
        });
        elements.push(mute);

        // Expand notifications
        const notifications = new ToolBoxButton('Expand notifications', SvgImage.Icon.NOTIFICATIONS);
        notifications.addEventListener('click', () => {
            client.sendMessage(new CommandControlMessage(ControlMessage.TYPE_EXPAND_NOTIFICATION_PANEL));
        });
        elements.push(notifications);

        // Expand quick settings
        const quickSettings = new ToolBoxButton('Expand quick settings', SvgImage.Icon.QUICK_SETTINGS);
        quickSettings.addEventListener('click', () => {
            client.sendMessage(new CommandControlMessage(ControlMessage.TYPE_EXPAND_SETTINGS_PANEL));
        });
        elements.push(quickSettings);

        // Rotate screen
        const rotate = new ToolBoxButton('Rotate screen', SvgImage.Icon.ROTATE_SCREEN);
        rotate.addEventListener('click', () => {
            client.sendMessage(new CommandControlMessage(ControlMessage.TYPE_ROTATE_DEVICE));
        });
        elements.push(rotate);

        // Wake / lock screen button
        const wakeLock = new ToolBoxButton('Wake / lock screen', SvgImage.Icon.WAKE_SCREEN);
        wakeLock.addEventListener('click', () => {
            client.sendMessage(new CommandControlMessage(ControlMessage.TYPE_BACK_OR_SCREEN_ON));
        });
        elements.push(wakeLock);

        // Lock screen (set screen power OFF)
        const lockScreen = new ToolBoxButton('Lock screen', SvgImage.Icon.LOCK_SCREEN);
        lockScreen.addEventListener('click', () => {
            client.sendMessage(CommandControlMessage.createSetScreenPowerModeCommand(false));
        });
        elements.push(lockScreen);

        if (player.supportsScreenshot) {
            const screenshot = new ToolBoxButton('Take screenshot', SvgImage.Icon.CAMERA);
            screenshot.addEventListener('click', () => {
                player.createScreenshot(client.getDeviceName());
            });
            elements.push(screenshot);
        }

        // Fullscreen toggle
        const displayId = player.getVideoSettings().displayId;
        const fullscreenId = `fullscreen_${udid}_${playerName}_${displayId}`;
        const fullscreen = new ToolBoxCheckbox('Fullscreen', {
            off: SvgImage.Icon.FULLSCREEN,
            on: SvgImage.Icon.FULLSCREEN_EXIT,
        }, fullscreenId);
        fullscreen.addEventListener('click', (_, el) => {
            const checked = (el.getElement() as HTMLInputElement).checked;
            if (checked) {
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().catch((err) => {
                        console.warn('Fullscreen request failed:', err);
                    });
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch((err) => {
                        console.warn('Exit fullscreen failed:', err);
                    });
                }
            }
        });
        // Sync checkbox when fullscreen changes externally (e.g. Esc key)
        document.addEventListener('fullscreenchange', () => {
            const inputEl = fullscreen.getElement() as HTMLInputElement;
            inputEl.checked = !!document.fullscreenElement;
        });
        elements.push(fullscreen);

        const keyboard = new ToolBoxCheckbox(
            'Capture keyboard',
            SvgImage.Icon.KEYBOARD,
            `capture_keyboard_${udid}_${playerName}`,
        );
        keyboard.addEventListener('click', (_, el) => {
            const element = el.getElement();
            client.setHandleKeyboardEvents(element.checked);
        });
        elements.push(keyboard);

        if (moreBox) {
            const id = `show_more_${udid}_${playerName}_${displayId}`;
            const more = new ToolBoxCheckbox('More', SvgImage.Icon.MORE, id);
            more.addEventListener('click', (_, el) => {
                const element = el.getElement();
                moreBox.style.display = element.checked ? 'block' : 'none';
            });
            elements.unshift(more);
        }
        return new GoogToolBox(elements);
    }
}
