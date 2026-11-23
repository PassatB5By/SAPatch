using System;
using System.Runtime.InteropServices;

namespace SAPatcher;

public static class WindowsAudioDeviceService
{
    [ComImport]
    [Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
    private class MMDeviceEnumeratorComObject { }

    [Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMMDeviceEnumerator
    {
        int EnumAudioEndpoints(int dataFlow, int dwStateMask, out IntPtr ppEndpoints);
        [PreserveSig]
        int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice ppDevice);
    }

    [Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IMMDevice
    {
        [PreserveSig]
        int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
    }

    [Guid("C02216F6-8C67-4B5B-9D00-D008E73E0064"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IAudioMeterInformation
    {
        [PreserveSig]
        int GetPeakValue(out float pfPeak);
        [PreserveSig]
        int GetMeteringChannelCount(out int pnChannelCount);
        [PreserveSig]
        int GetChannelsPeakValues(int u32ChannelCount, [In, Out] float[] afPeakValues);
    }

    [Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    private interface IAudioEndpointVolume
    {
        int RegisterControlChangeNotify(IntPtr pNotify);
        int UnregisterControlChangeNotify(IntPtr pNotify);
        int GetChannelCount(out int pnChannelCount);
        int SetMasterVolumeLevel(float fLevelDB, Guid pguidEventContext);
        [PreserveSig]
        int SetMasterVolumeLevelScalar(float fLevel, Guid pguidEventContext);
        int GetMasterVolumeLevel(out float pfLevelDB);
        [PreserveSig]
        int GetMasterVolumeLevelScalar(out float pfLevel);
    }

    private static readonly Guid IID_IAudioMeterInformation = new("C02216F6-8C67-4B5B-9D00-D008E73E0064");
    private static readonly Guid IID_IAudioEndpointVolume = new("5CDF2C82-841E-4546-9722-0CF74078229A");

    private static IMMDevice? GetDefaultRenderDevice()
    {
        try
        {
            var enumerator = (IMMDeviceEnumerator)new MMDeviceEnumeratorComObject();
            int hr = enumerator.GetDefaultAudioEndpoint(0, 1, out IMMDevice dev); // eRender = 0, eMultimedia = 1
            if (hr == 0 && dev != null)
            {
                return dev;
            }
        }
        catch {}
        return null;
    }

    public static float GetAudioPeak()
    {
        try
        {
            var dev = GetDefaultRenderDevice();
            if (dev == null) return 0f;

            Guid iid = IID_IAudioMeterInformation;
            int hr = dev.Activate(ref iid, 1, IntPtr.Zero, out object meterObj);
            if (hr == 0 && meterObj is IAudioMeterInformation meter)
            {
                meter.GetPeakValue(out float peak);
                return Math.Clamp(peak, 0f, 1f);
            }
        }
        catch {}
        return 0f;
    }

    public static int GetMasterVolumePercent()
    {
        try
        {
            var dev = GetDefaultRenderDevice();
            if (dev == null) return 50;

            Guid iid = IID_IAudioEndpointVolume;
            int hr = dev.Activate(ref iid, 1, IntPtr.Zero, out object volObj);
            if (hr == 0 && volObj is IAudioEndpointVolume vol)
            {
                vol.GetMasterVolumeLevelScalar(out float scalar);
                return (int)Math.Round(Math.Clamp(scalar, 0f, 1f) * 100f);
            }
        }
        catch {}
        return 50;
    }

    public static void SetMasterVolumePercent(int percent)
    {
        try
        {
            var dev = GetDefaultRenderDevice();
            if (dev == null) return;

            Guid iid = IID_IAudioEndpointVolume;
            int hr = dev.Activate(ref iid, 1, IntPtr.Zero, out object volObj);
            if (hr == 0 && volObj is IAudioEndpointVolume vol)
            {
                float scalar = Math.Clamp(percent / 100f, 0f, 1f);
                vol.SetMasterVolumeLevelScalar(scalar, Guid.Empty);
            }
        }
        catch {}
    }
}
