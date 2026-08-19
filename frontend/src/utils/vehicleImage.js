const getVehicleImage = (vehicle) => {
  if (vehicle.image_url) {
    return vehicle.image_url;
  }
  if (vehicle.image) {
    const img = vehicle.image.startsWith('/media/') ? vehicle.image : `/media/${vehicle.image}`;
    return img;
  }
  return '/images/default-car.jpg';
};

export default getVehicleImage;
