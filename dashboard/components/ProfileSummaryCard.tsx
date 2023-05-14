/* eslint-disable @next/next/no-img-element */

import { formatNumber, getIPFSURL, shortHash } from "@/lib/utils";
import { Profile } from "@lens-protocol/react-web";
import {
  CheckCircle2,
  Fingerprint,
  Tags,
  Webhook,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Balance from "react-wrap-balancer";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function ProfileSummaryCard({ profile }: { profile: Profile }) {
  if (!profile) return null;
  return (
    <>
      <div>
        <div className="mt-6 h-2/4 overflow-hidden rounded-lg sm:h-64">
          {profile.coverPicture ? (
            <img
              className="w-full object-cover"
              src={getIPFSURL(profile.coverPicture)}
              alt="cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-rose-100 to-teal-100" />
          )}
        </div>
        <div className="flex flex-col sm:flex-row">
          <div className="-mt-16 flex flex-col sm:w-1/2 ">
            <div className="mb-5 flex px-5">
              {profile.picture ? (
                <img
                  className="h-32 w-32 rounded-full object-cover"
                  src={getIPFSURL(profile.picture)}
                  alt="profile"
                />
              ) : (
                <Image
                  src="/images/default-profile.png"
                  alt="profile"
                  width={128}
                  height={128}
                  className="h-32 w-32 rounded-full object-cover"
                />
              )}
            </div>
            <div className="mb-8 flex flex-col px-7">
              <h2 className="text-3xl font-bold text-gray-900">
                {profile.name}
              </h2>
              <span className="mt-2 text-gray-400 dark:text-gray-400">
                {profile.id} - #{Number(profile.id)}
              </span>
              <Balance className="mt-2 text-gray-400 dark:text-gray-400">
                @{profile.handle}
              </Balance>
              <p className="mt-2 text-gray-600">{profile.bio}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 py-7 sm:w-1/2 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(profile.stats)
              .filter(
                ([key]) =>
                  !key.startsWith("__") &&
                  key !== "commentsCount" &&
                  key !== "postsCount" &&
                  key !== "mirrorsCount"
              )
              .map(([key, value]) => (
                <Card key={key} className="overflow-scroll rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {key.replace(/^total/, "")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatNumber(value)}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Categories</CardTitle>
            <Tags />
          </CardHeader>

          <CardContent className="flex flex-col space-y-3 overflow-scroll">
            {profile.__attributes!.map(
              ({ key, value }) =>
                value !== "[]" && (
                  <div
                    key={key}
                    className="flex flex-col space-y-1 font-medium"
                  >
                    <span className="text-sm uppercase text-gray-600">
                      {key.replace(/([a-z])([A-Z])/g, "$1 $2")}
                    </span>
                    {key.toLocaleLowerCase().includes("website") ? (
                      <Link href={value}>{value} </Link>
                    ) : key.toLocaleLowerCase().includes("twitter") ? (
                      <Link href={`https://twitter.com/${value}`}>{value}</Link>
                    ) : (
                      <span>{value}</span>
                    )}
                  </div>
                )
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>On-Chain Identity</CardTitle>
            <Fingerprint />
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium uppercase text-gray-600">
                Proof of Humanity
              </span>
              {profile.onChainIdentity.proofOfHumanity ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium uppercase text-gray-600">
                ENS Name
              </span>
              <span className="font-medium">
                {profile.onChainIdentity.ens?.name
                  ? String(profile.onChainIdentity.ens.name)
                  : "-"}
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium uppercase text-gray-600">
                Sybil.org Verified
              </span>
              {profile.onChainIdentity.sybilDotOrg.verified ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium uppercase text-gray-600">
                Twitter Handle
              </span>
              <span className="font-medium">
                {profile.onChainIdentity.sybilDotOrg.source.twitter.handle ||
                  "-"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Dispatcher</CardTitle>
            <Webhook />
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium uppercase text-gray-600">
                Address
              </span>
              <Link
                href={`https://polygonscan.com/address/${profile.dispatcher?.address}`}
                target="_blank"
                className="font-medium underline underline-offset-4"
              >
                {shortHash(profile.dispatcher?.address)}
              </Link>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium uppercase text-gray-600">
                Can Use Relay
              </span>
              {profile.dispatcher?.canUseRelay ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
