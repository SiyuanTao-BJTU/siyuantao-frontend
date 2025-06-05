import BackendConfig from '@/../backend.config.js';

const FormatObject = {
  formattedTransactionRecord: (recordList) => {
    if (!Array.isArray(recordList)) {
      console.error("formattedTransactionRecord: input is not an array", recordList);
      return [];
    }
    return recordList.map(entry => {
      const product = entry.product || {};
      const buyer = entry.buyer || {};
      const seller = entry.seller || {};
      const images = Array.isArray(product.images) ? product.images : [];

      let primaryImagePath = null;
      if (images.length > 0) {
        const primaryImageObj = images.find(img => img.is_primary === true);
        if (primaryImageObj && primaryImageObj.image_path) {
          primaryImagePath = primaryImageObj.image_path;
        } else if (images.length > 0 && images[0] && images[0].image_path) {
          primaryImagePath = images[0].image_path; // Fallback to the first image
        }
      }
      const mainPicture = primaryImagePath ? FormatObject.formattedImgUrl(primaryImagePath) : null;

      const pictureListFormatted = images
        .map(img => img.image_path ? FormatObject.formattedImgUrl(img.image_path) : null)
        .filter(url => url !== null);

      // Retain original API status string and other necessary fields for TableInfo.vue to process further
      return {
        // Raw API data points that TableInfo might need for display or logic before numeric state conversion
        id: entry.id,
        api_status: entry.status, // Keep the original API status string
        buyer_id: buyer.id,
        seller_id: seller.id,
        buyer_username: buyer.username,
        seller_username: seller.username, 
        product_name: product.name,
        product_price: product.price,
        product_condition: product.condition,
        product_main_image_url: mainPicture,
        product_all_image_urls: pictureListFormatted,
        quantity: entry.quantity,
        create_time: entry.create_time,
        location: entry.location,
        meet_time: entry.meet_time
        // Add any other raw fields from 'entry' or 'product' that TableInfo.vue might directly use or need for its state conversion
      };
    });
  },

  formattedChatroomList: (chatroomList) => {
    if (!Array.isArray(chatroomList)) return [];
    return chatroomList.map(entry => ({
      seller: entry.seller,
      buyer: entry.buyer,
      room_id: entry.room_id,
      type: entry.type,
      item_id: entry.item_id,
      contact: entry.type === "seller" ? entry.buyer : entry.seller
    }));
  },

  formattedImgUrl: (res_img_url) => {
    if (!res_img_url) return null; 
    // Check if the URL is already a complete URL (http or https)
    if (res_img_url.startsWith('http://') || res_img_url.startsWith('https://')) {
      return res_img_url; // It's already a complete URL, return directly
    }

    // Use the base URL from backend.config.js
    const baseUrl = BackendConfig.BASIC_URL; // Revert to BASIC_URL

    // Ensure baseUrl does not end with / and the image path does not start with / for correct joining
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    // The image path from the backend is already expected to be like '/uploads/...', so we don't need to add '/uploads/' again.
    const imgPath = res_img_url.startsWith('/') ? res_img_url : '/' + res_img_url; // Ensure imgPath starts with /

    return `${base}${imgPath}`;
  },

  formattedImgUrlList: (res_img_url_list) => {
    if (!Array.isArray(res_img_url_list)) return [];
    return res_img_url_list.map((img_url) => FormatObject.formattedImgUrl(img_url)).filter(url => url !== null);
  },

  formattedUUID: (uuid) => {
    if (!uuid || typeof uuid !== 'string') return '';
    return uuid.substring(0, 8);
  }
}

export default FormatObject;