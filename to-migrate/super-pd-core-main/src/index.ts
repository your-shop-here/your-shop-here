declare global {
    var emit: (event: any, handleClose?: Function) => void;

    var EditorsContext: any;
    var parentIFrame: any;
}

export * from './editors';
