export const calcMid = (x1: string, x2: string, y1:string, y2:string): string => 
    {
    // Convert to numbers FIRST
    const numX1 = Number(x1);
    const numX2 = Number(x2);
    const numY1 = Number(y1);
    const numY2 = Number(y2);

    let mid1 = (numX1 + numY1) / 2;
    let mid2 = (numX2 + numY2) / 2;

    let result = "(" + mid1.toString() + "," + mid2.toString() + ")";

    return result;

};

export const euclideanDistance = (x1: string, y1: string, x2: string, y2: string): string => 
    {
    const numX1 = Number(x1);
    const numY1 = Number(y1);
    const numX2 = Number(x2);
    const numY2 = Number(y2);

    return Math.sqrt(Math.pow(numX2 - numX1, 2) + Math.pow(numY2 - numY1, 2)).toString();
}

export const calcSum = (num1: string, num2: string, num3: string): string => 
{
    return (Number(num1) + Number(num2) + Number(num3)).toString();
}

export const calcDifference = (num1: string, num2:string, num3:string): string =>
{
    return (Number(num1) - Number(num2) - Number(num3)).toString();
}

export const calcMultiply = (num1: string, num2: string, num3: string): string =>
{
    return (Number(num1) * Number(num2) * Number(num3)).toString();

}