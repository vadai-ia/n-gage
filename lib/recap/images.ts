// Variantes de Cloudinary vía transformaciones en la URL. Si la URL no es de
// Cloudinary se regresa tal cual.

function withTransform(url: string, transform: string): string {
  return url.includes("/upload/") ? url.replace("/upload/", `/upload/${transform}/`) : url;
}

export const recapImage = {
  avatar: (url: string) => withTransform(url, "w_160,h_160,c_fill,g_face,q_auto,f_auto"),
  thumb: (url: string) => withTransform(url, "w_480,h_480,c_fill,g_auto,q_auto,f_auto"),
  hero: (url: string) => withTransform(url, "w_1600,h_1200,c_fill,g_auto,q_auto,f_auto"),
  large: (url: string) => withTransform(url, "w_1800,c_limit,q_auto,f_auto"),
  download: (url: string) => withTransform(url, "fl_attachment"),
};
