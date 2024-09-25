export enum PublicMessage {
  LoggedIn = "با موفقیت وارد شدید",
  Sentotp = "کد یکبار مصرف ارسال شد",
  Created = "با موفقیت ساخته شد",
  Updated = "بروزرسانی شد.",
  Deleted = "به درستی حذف شد",
}
export enum BadRequestMessage {
  SomeError = "خطا رخ داده است بعدا امتحان کنید",
  InValidLoginData = "اطلاعات ورود درست نمی باشد",
  InvalidCategory = "اطلاعات دسته بندی  درست نمیباشد",
}
export enum AuthMessage {
  IncorrectEmail = "ایمیل یا فرمت ان اشتباه است",
  InvalidUsername = "نام کاربری معتبر نمیباشد",
  NotFoundAccount = "حساب کاربری یافت نشد",
  TryAgain = "دوباره تلاش کنید",
  LoginAgain = "دوباره وارد شوید",
  AlreadyExistAccount = "حساب کاربری از قبل ساخته شده است",
  ExpiredCode = "کد یکبار مصرف منقضی شده است",
  LoginIsRequired = "ورود به حساب کاربری الزامی است",
}

export enum ConflictMessage {
  CategoryTitle = "دسته بندی قبلا ثبت شد",
  Phone = "شماره تلفن قبلا ثبت شده است",
  Email = "ایمیل قبلا ثبت شده است",
  Username = "نام کاربری قبلا ثبت شده است . مقدار دیگری وارد کنید",
}

export enum NotFoundMessage {
  NotFoundCategory = "دسته بندی یافت نشد",
  NotFound = "یافت نشد",
  NotFoundEvent = "رویداد موردنظر یافت نشد",
  NotFoundUpcomingEvent = "رویدادی در بازه زمانی انتخابی شما یافت نشد",
}

export enum InvalidMessage {
  InvalidPhoneFormat = "شماره تلفن صحیح نمیباشد",
  InvalidEmailFormat = "ایمیل صحیح نمیباشد",
}
export enum EventMessage {
  FanLimitMessage = "متاسفانه ظرفیت رویداد تکمیل شده است",
  EventFinished = "رویداد به پایان رسیده است",
  EventReserved = "با موفقیت رزرو شد",
}

export function EventPrice(price: number) {
  return `مبلغ قابل پرداخت ${price} می باشد . لطفا نسبت به واریز وجه اقدام نمایید`;
}
