
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export async function call(call: Promise<Response>) {
  const resp = await call;
  if (!resp.ok) {
    throw new Error('Issue during call');
  }
  const respStr = await resp.text();
  if (!respStr) {
    return null;
  }
  return JSON.parse(respStr);
}

export async function get(url: string): Promise<any> {
  return call(fetch(API_BASE_URL + url));
}

export async function post(url: string, body: any): Promise<any> {
  return call(fetch(API_BASE_URL + url, {method: "POST", body: body ? JSON.stringify(body) : null, headers: {"Content-Type": "application/json"}}));
}

export async function put(url: string, body: any): Promise<any> {
  return call(fetch(API_BASE_URL + url, {method: "PUT", body: body ? JSON.stringify(body) : null, headers: {"Content-Type": "application/json"}}));
}

export async function patch(url: string, body: any): Promise<any> {
  return call(fetch(API_BASE_URL + url, {method: "PATCH", body: body ? JSON.stringify(body) : null, headers: {"Content-Type": "application/json"}}));
}

export async function deleteCall(url: string): Promise<any> {
  return call(fetch(API_BASE_URL + url, {method: "DELETE"}));
}

export async function newTab(url: string): Promise<any> {
  window.open(API_BASE_URL + url, '_blank');
}

export function formatDate(date?: string): string {
  if (!date) {
    return '';
  }
  const d = new Date(date);
  return `${d.getFullYear().toString().substring(-2)}-${leftPadding(d.getMonth() + 1, 2)}-${leftPadding(d.getDate(), 2)} ${leftPadding(d.getHours(), 2)}:${leftPadding(d.getMinutes(), 2)}`;
}

export function leftPadding(str: any, padding: number): string {
  return String(str).padStart(padding, '0');
}
