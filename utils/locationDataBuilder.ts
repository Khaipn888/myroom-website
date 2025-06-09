export interface LocationMap {
  [province: string]: {
    districts: string[];
    wardMap: {
      [district: string]: string[];
    };
  };
}

export const convertLocationData = (raw: any): LocationMap => {
  const map: LocationMap = {};

  raw.data.forEach((prov: any) => {
    const provinceName = prov.name;
    map[provinceName] = {
      districts: [],
      wardMap: {},
    };

    prov.level2s?.forEach((dist: any) => {
      const distName = dist.name;
      map[provinceName].districts.push(distName);
      map[provinceName].wardMap[distName] = dist.level3s?.map((ward: any) => ward.name) || [];
    });
  });

  return map;
};
