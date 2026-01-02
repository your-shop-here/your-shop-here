export function generateSalt(length: number) : string {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function getClosestAncestor(element: HTMLElement | null | undefined, parentSelector: string) {
    if(!element || !parentSelector) return null;

    do {
        element = element!.parentElement;
    } while (
        !element?.matches(parentSelector) ||
        element.isSameNode(document.body)
    );

    return element;
}

export function getDistanceToAncestor(element: HTMLElement | null, ancestor: HTMLElement | null) {
    let topDistance = 0;
    let leftDistance = 0;

    // Ensure both the element and ancestor are provided
    if (!element || !ancestor) {
        console.error("Both element and ancestor must be provided");
        return { top: 0, left: 0 };
    }

    // Loop through the offsetParent chain and accumulate distances
    while (element && element !== ancestor && ancestor.contains(element)) {
        topDistance += element.offsetTop;
        leftDistance += element.offsetLeft;
        element = element.offsetParent as HTMLElement;
    }

    return { top: topDistance, left: leftDistance };
}

