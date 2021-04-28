import ToastClient from "./ToastClient";

interface Conf {
    name: string,
    once?: boolean
}

type EventOptions = Conf;

export default abstract class Event {
    public conf: Conf;

    protected constructor(public client: ToastClient, options: EventOptions) {
        this.client = client;

        this.conf = {
            name: options.name,
            once: options.once || false
        };
    }

    public abstract run(...args: readonly unknown[]): unknown;
}